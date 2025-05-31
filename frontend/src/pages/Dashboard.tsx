/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import { useRecoilState } from 'recoil';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
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
            style: { background: '#fef2f2', color: '#b91c1c' },
          });
          navigate('/signin');
        }
      } catch (err) {
        console.error(err);
        toast.error('Error fetching user data', {
          duration: 3000,
          style: { background: '#fef2f2', color: '#b91c1c' },
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
          // Sort history messages chronologically (oldest first)
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
        style: { background: '#fef2f2', color: '#b91c1c' },
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
        return [...prev, message]; // Append without reversing
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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gray-50 flex flex-col"
    >
      <Navbar />
      {isLoading ? (
        <div className="container flex flex-col items-center justify-center flex-grow">
          <motion.div
            className="flex items-center gap-2 text-gray-600"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          >
            <svg className="h-6 w-6" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              />
            </svg>
            Loading...
          </motion.div>
        </div>
      ) : (
        <main className="container flex flex-col lg:flex-row flex-grow py-4 md:py-8 px-4 md:px-6">
          <div className="w-full lg:w-1/3 lg:pr-4 mb-4 lg:mb-0">
            <UserSearch
              onSelectUser={setSelectedUser}
              currentUserEmail={user?.email || null}
              allMessages={allMessages}
            />
          </div>
          <div className="w-full lg:w-2/3">
            <ChatWindow
              selectedUser={selectedUser}
              messages={messages}
              onlineUsers={onlineUsers}
              currentUserEmail={user?.email || null}
              onSendMessage={handleSendMessage}
            />
          </div>
        </main>
      )}
    </motion.div>
  );
};