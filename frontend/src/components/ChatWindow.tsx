import React, { useState, useEffect } from 'react';
import { sendMessage, type Message } from '../utils/websocket';

interface ChatWindowProps {
  selectedUser: string | null;
  messages: Message[];
  onlineUsers: string[];
  currentUserEmail: string | null;
  onSendMessage: (message: Message) => void;
}

export const ChatWindow = ({
  selectedUser,
  messages,
  onlineUsers,
  currentUserEmail,
  onSendMessage,
}: ChatWindowProps) => {
  const [message, setMessage] = useState('');
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
const filteredMessages = messages.slice().reverse();
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (selectedUser && message.trim()) {
      const outgoingMessage: Message = {
        from: currentUserEmail || '',
        to: selectedUser,
        message,
        timestamp: new Date().toISOString(),
      };
      sendMessage(outgoingMessage);
      onSendMessage(outgoingMessage);
      setMessage('');
    }
  };

  console.log('ChatWindow messages:', messages);
  console.log("filteredMessages:", filteredMessages);
  return (
    <div className="flex flex-col h-full bg-white shadow-lg rounded-lg">
      <div className="p-4 border-b">
        <h3 className="text-lg font-medium">
          {selectedUser || 'Select a user to chat'}
          {selectedUser && (
            <span className="ml-2 text-sm text-gray-600">
              {onlineUsers.includes(selectedUser) ? '(Online)' : '(Offline)'}
            </span>
          )}
        </h3>
      </div>
      <div className="flex-1 p-4 overflow-y-auto flex flex-col">
        {filteredMessages.map((msg, index) => (
          <div
            key={index}
            className={`mb-4 ${msg.from === currentUserEmail ? 'text-right' : 'text-left'}`}
          >
            <p className="bg-gray-100 p-2 rounded-lg inline-block break-words">{msg.message}</p>
            <p className="text-xs text-gray-400">{new Date(msg.timestamp).toLocaleTimeString()}</p>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      {selectedUser && (
        <div className="p-4 border-t">
          <div className="flex space-x-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Type a message..."
              className="input flex-1"
            />
            <button onClick={handleSend} className="btn btn-primary">
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
};