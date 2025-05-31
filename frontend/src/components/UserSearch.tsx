import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { debounce } from 'lodash';
import { searchUsers } from '../utils/api';
import { type Message } from '../utils/websocket';

interface User {
  email: string;
  name: string;
}

interface UserSearchProps {
  onSelectUser: (email: string) => void;
  currentUserEmail: string | null;
  allMessages: Map<string, Message[]>;
}

export const UserSearch = ({ onSelectUser, currentUserEmail, allMessages }: UserSearchProps) => {
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState('');
  const [conversations, setConversations] = useState<{ user: string; lastMessage: Message | null }[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);


  useEffect(() => {
    if (currentUserEmail) {
      const updatedConversations = Array.from(allMessages.entries())
        .map(([user, messages]) => {
          const sortedMessages = messages.sort(
            (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          );
          return {
            user,
            lastMessage: sortedMessages[0] || null,
          };
        })
        .sort((a, b) => {
          if (!a.lastMessage) return 1;
          if (!b.lastMessage) return -1;
          return new Date(b.lastMessage.timestamp).getTime() - new Date(a.lastMessage.timestamp).getTime();
        });
      setConversations(updatedConversations);
    }
  }, [allMessages, currentUserEmail]);

  const debouncedSearch = useRef(
    debounce(async (value: string) => {
      if (value.length > 2) {
        try {
          const response = await searchUsers(value);
          if (response.data.success) {
            setUsers(response.data.users);
            setError('');
          } else {
            setError(response.data.msg);
            toast.error(response.data.msg, {
              duration: 3000,
              style: { background: '#fef2f2', color: '#b91c1c' },
            });
          }
        } catch (err) {
          console.log(err)
          setError('Failed to search users');
          toast.error('Failed to search users', {
            duration: 3000,
            style: { background: '#fef2f2', color: '#b91c1c' },
          });
        }
      } else {
        setUsers([]);
        setError('');
      }
    }, 300)
  ).current;

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    debouncedSearch(value);
  };

  return (
    <div className="bg-gray-50 p-4 rounded-xl shadow-sm">
      <motion.input
        ref={inputRef}
        type="text"
        value={query}
        onChange={handleSearch}
        placeholder="Search users by email..."
        className="input mb-4 bg-gray-50 text-gray-800 placeholder-gray-400"
        aria-label="Search users"
        whileFocus={{ scale: 1.02 }}
      />
      {error && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-red-500 text-sm mb-4"
        >
          {error}
        </motion.p>
      )}
      <AnimatePresence>
        {users.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-2 bg-white rounded-lg shadow-sm max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
          >
            {users.map((user) => (
              <motion.div
                key={user.email}
                onClick={() => onSelectUser(user.email)}
                className="p-3 hover:bg-gray-100 cursor-pointer border-b border-gray-200"
                whileHover={{ backgroundColor: '#f7f7f7' }}
              >
                <p className="font-medium text-gray-800">{user.name}</p>
                <p className="text-sm text-gray-500">{user.email}</p>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
      <div className="mt-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Conversations</h3>
        <AnimatePresence>
          {conversations.length === 0 && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-gray-500 text-sm"
            >
              No conversations yet.
            </motion.p>
          )}
          {conversations.map((conv) => (
            console.log(conv),
            <motion.div
              key={conv.user}
              onClick={() => onSelectUser(conv.user)}
              className="p-3 hover:bg-gray-100 cursor-pointer border-b border-gray-200"
              whileHover={{ backgroundColor: '#f7f7f7' }}
            >
              <p className="font-medium text-gray-800">{conv.user}</p>
              {conv.lastMessage && (
                <p className="text-sm text-gray-500 truncate">
                  {conv.lastMessage.message}
                </p>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};