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

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="flex-shrink-0 px-8 py-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-medium text-gray-900 truncate tracking-tight">
              {selectedUser || 'Select a conversation'}
            </h2>
            {selectedUser && (
              <div className="flex items-center mt-1">
                <div className={`w-2 h-2 rounded-full mr-2 ${
                  onlineUsers.includes(selectedUser) ? 'bg-green-500' : 'bg-gray-300'
                }`} />
                <span className="text-sm text-gray-500 font-light">
                  {onlineUsers.includes(selectedUser) ? 'Online' : 'Offline'}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-8 py-6">
        {!selectedUser ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 border border-gray-200 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <p className="text-gray-500 text-sm font-light">Choose a conversation to start messaging</p>
            </div>
          </div>
        ) : filteredMessages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <p className="text-gray-500 text-sm font-light">No messages yet</p>
              <p className="text-gray-400 text-xs mt-1">Send a message to start the conversation</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredMessages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${
                  msg.from === currentUserEmail ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[75%] px-4 py-3 ${
                    msg.from === currentUserEmail
                      ? 'bg-black text-white'
                      : 'bg-gray-50 text-gray-900 border border-gray-100'
                  }`}
                >
                  <p className="text-sm leading-relaxed break-words">{msg.message}</p>
                  <p className={`text-xs mt-2 ${
                    msg.from === currentUserEmail ? 'text-gray-300' : 'text-gray-500'
                  }`}>
                    {new Date(msg.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area */}
      {selectedUser && (
        <div className="flex-shrink-0 px-8 py-6 border-t border-gray-100">
          <div className="flex items-end space-x-4">
            <div className="flex-1">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type a message..."
                rows={1}
                className="w-full resize-none bg-gray-50 border border-gray-200 px-4 py-3 text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-colors"
                style={{
                  minHeight: '44px',
                  maxHeight: '120px',
                }}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = 'auto';
                  target.style.height = `${Math.min(target.scrollHeight, 120)}px`;
                }}
              />
            </div>
            <button
              onClick={handleSend}
              disabled={!message.trim()}
              className={`px-6 py-3 text-sm font-medium transition-colors ${
                message.trim()
                  ? 'bg-black text-white hover:bg-gray-800'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
};