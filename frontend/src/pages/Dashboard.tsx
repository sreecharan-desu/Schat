/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import { useRecoilState } from 'recoil';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getUser } from '../utils/api';
import { type User, userAtom } from '../store/store';
import { connectWebSocket, type Message, type StatusUpdate, type Ack, disconnectWebSocket } from '../utils/websocket';
import { Navbar } from '../components/Navbar';
import { UserSearch } from '../components/UserSearch';
import { ChatWindow } from '../components/ChatWindow';

export const Dashboard = () => {
  const [user, setUser] = useRecoilState<User | null>(userAtom);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [allMessages, setAllMessages] = useState<Map<string, Message[]>>(new Map());
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await getUser();
        if (response.data.success) {
          setUser(response.data.user);
        } else {
          toast.error('Failed to fetch user data', {
            duration: 3000,
            style: { background: '#FFFFFF', color: '#000000', border: '1px solid #000000' },
          });
          navigate('/signin');
        }
      } catch (err) {
        console.error(err);
        toast.error('Error fetching user data', {
          duration: 3000,
          style: { background: '#FFFFFF', color: '#000000', border: '1px solid #000000' },
        });
        navigate('/signin');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();

    const token = localStorage.getItem('token');
    if (token) {
      connectWebSocket(token, (data: Message | StatusUpdate | Ack | any) => {
        if (data.type === 'status_update') {
          setOnlineUsers((data as StatusUpdate).onlineUsers);
        } else if (data.type === 'ack') {
          console.log('Ack:', data);
        } else if (data.type === 'history') {
          const { messages: historyMessages, withUser } = data;
          const sortedHistory = historyMessages.sort(
            (a: Message, b: Message) =>
              new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
          );
          setAllMessages((prev) => {
            const updated = new Map(prev).set(withUser, sortedHistory);
            if (withUser === selectedUser) {
              setMessages(sortedHistory);
            }
            return updated;
          });
        } else {
          const message = data as Message;
          setAllMessages((prev) => {
            const key = message.from === user?.email ? message.to : message.from;
            const existing = prev.get(key) || [];
            const updated = [...existing, message];
            return new Map(prev).set(key, updated);
          });
          if (
            (message.from === selectedUser && message.to === user?.email) ||
            (message.from === user?.email && message.to === selectedUser)
          ) {
            setMessages((prev) => [...prev, message]);
          }
        }
      });
    } else {
      toast.error('No authentication token found', {
        duration: 3000,
        style: { background: '#FFFFFF', color: '#000000', border: '1px solid #000000' },
      });
      navigate('/signin');
    }

    return () => {
      disconnectWebSocket();
    };
  }, [navigate, setUser, user?.email]);

  useEffect(() => {
    setMessages(allMessages.get(selectedUser || '') || []);
  }, [selectedUser, allMessages]);

  const handleSendMessage = (message: Message) => {
    setMessages((prev) => {
      if (message.to === selectedUser && message.from === user?.email) {
        return [...prev, message];
      }
      return prev;
    });
    setAllMessages((prev) => {
      const key = message.to;
      const existing = prev.get(key) || [];
      const updated = [...existing, message];
      return new Map(prev).set(key, updated);
    });
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      {isLoading ? (
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm text-black font-light tracking-wide">Loading</p>
          </div>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[calc(100vh-12rem)]">
            {/* User Search Panel */}
            <div className="lg:col-span-1 bg-white border border-gray-200 rounded-none">
              <div className="h-full">
                <UserSearch
                  onSelectUser={setSelectedUser}
                  currentUserEmail={user?.email || null}
                  allMessages={allMessages}
                />
              </div>
            </div>

            {/* Chat Window */}
            <div className="lg:col-span-2 bg-white border border-gray-200 rounded-none">
              <div className="h-full">
                <ChatWindow
                  selectedUser={selectedUser}
                  messages={messages}
                  onlineUsers={onlineUsers}
                  currentUserEmail={user?.email || null}
                  onSendMessage={handleSendMessage}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};