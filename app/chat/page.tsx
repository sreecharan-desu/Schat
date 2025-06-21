"use client";
import { useState, useEffect, useRef } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import { uniqueNamesGenerator, adjectives, animals } from 'unique-names-generator';
import { Send, Users, Wifi, WifiOff, ArrowLeft, Zap, Globe, Shield } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';

interface Message {
  name: string;
  message: string;
  timestamp?: number;
  id?: string;
  onlineUsers?: number;
}

export default function Chat() {
  const { data: session } = useSession();
  const [name, setName] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState<string>('');
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<string>('Connecting...');
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [onlineUsers, setOnlineUsers] = useState<number>(0);
  const [, setMessageCount] = useState<number>(89563);
  const [showWelcome, setShowWelcome] = useState<boolean>(true);
  const maxLength = 280;
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (session) {
      setName(session.user?.name || 'Anonymous');
    } else {
      const anonymousName = uniqueNamesGenerator({ dictionaries: [adjectives, animals], separator: ' ' });
      setName(anonymousName);
    }
  }, [session]);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageCount((prev) => prev + Math.floor(Math.random() * 3));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let socket: WebSocket | null = null;
    let reconnectTimeout: NodeJS.Timeout | null = null;
    let heartbeatInterval: NodeJS.Timeout | null = null;
    let reconnectAttempts = 0;
    const maxReconnectAttempts = 5;
    const baseDelay = 1000;

    const wsUrl = process.env.NEXT_PUBLIC_WEBSOCKET_URL;
    if (!wsUrl) {
      console.error('WebSocket URL is not defined.');
      setConnectionStatus('Error: WebSocket URL not configured');
      return;
    }

    const connect = () => {
      socket = new WebSocket(wsUrl);
      setWs(socket);

      socket.onopen = () => {
        setConnectionStatus('Connected');
        console.log('Connected to WebSocket');
        reconnectAttempts = 0;
        if (reconnectTimeout) clearTimeout(reconnectTimeout);
        heartbeatInterval = setInterval(() => {
          if (socket && socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({ type: 'ping' }));
          }
        }, 30000);
      };

      socket.onmessage = (event) => {
        try {
          const data: Message = JSON.parse(event.data);
          if (data.name && data.message && data.id) {
            setMessages((prev) => {
              if (prev.some((msg) => msg.id === data.id)) {
                return prev;
              }
              const messageWithTimestamp = {
                ...data,
                timestamp: Date.now(),
              };
              return [...prev, messageWithTimestamp];
            });
            setShowWelcome(false);
            if (data.name !== name) {
              setIsTyping(true);
              setTimeout(() => setIsTyping(false), 2000);
            }
          }
          if (data.onlineUsers !== undefined) {
            setOnlineUsers(data.onlineUsers);
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      socket.onerror = (error) => {
        setConnectionStatus('Error connecting to server');
        console.error('WebSocket error:', error);
      };

      socket.onclose = (event) => {
        setConnectionStatus(`Disconnected, reconnecting... (Attempt ${reconnectAttempts + 1}/${maxReconnectAttempts})`);
        console.log('WebSocket closed:', event.code, event.reason);
        if (heartbeatInterval) clearInterval(heartbeatInterval);
        if (reconnectAttempts < maxReconnectAttempts) {
          const delay = baseDelay * Math.pow(2, reconnectAttempts);
          reconnectAttempts++;
          reconnectTimeout = setTimeout(connect, delay);
        } else {
          setConnectionStatus('Disconnected - Max retries reached');
        }
      };
    };

    connect();

    return () => {
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      if (heartbeatInterval) clearInterval(heartbeatInterval);
      if (socket) socket.close();
    };
  }, []);

  const sendMessage = () => {
    if (!input.trim() || !ws || ws.readyState !== WebSocket.OPEN || input.length > maxLength) return;
    
    const messageId = uuidv4();
    const message: Message = {
      name,
      message: input,
      timestamp: Date.now(),
      id: messageId,
    };

    setMessages((prev) => [...prev, message]);
    ws.send(JSON.stringify(message));
    setInput('');
    setShowWelcome(false);
    inputRef.current?.focus();
  };

  const formatTime = (timestamp?: number) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getRelativeTime = (timestamp?: number) => {
    if (!timestamp) return 'now';
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return formatTime(timestamp);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const isMyMessage = (msgName: string) => msgName === name;

  return (
    <div className="h-screen bg-black flex flex-col overflow-hidden font-sans">
      {/* Header */}
      <header className="relative z-10 bg-black/80 backdrop-blur-md border-b border-white/20 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => router.push('/')}
            className="lg:hidden text-white/70 hover:text-white transition-opacity focus:outline-none focus:ring-2 focus:ring-white/50 rounded"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center border border-white/20">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full border border-black animate-pulse"></div>
            </div>
            <div>
              <h1 className="text-white font-semibold text-lg tracking-tight">SChat</h1>
              <div className="flex items-center space-x-2 text-xs text-white/70">
                <div className="flex items-center space-x-1">
                  {connectionStatus === 'Connected' ? (
                    <Wifi className="w-3 h-3 text-white" />
                  ) : (
                    <WifiOff className="w-3 h-3 text-white/50" />
                  )}
                  <span className={connectionStatus === 'Connected' ? 'text-white' : 'text-white/50'}>
                    {connectionStatus}
                  </span>
                </div>
                <span>•</span>
                <span>
                  <span className="text-white">{onlineUsers.toLocaleString()}</span> online
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
              <span className="text-sm font-bold text-black">{name.charAt(0).toUpperCase()}</span>
            </div>
            <span className="text-sm text-white/70 hidden sm:inline">
              {name}
            </span>
          </div>
          {!session ? (
            <button
              onClick={() => signIn('google')}
              className="px-4 py-2 bg-white text-black rounded-full hover:bg-white/80 transition-opacity font-medium text-sm focus:outline-none focus:ring-2 focus:ring-white/50"
              aria-label="Sign in with Google"
            >
              Sign In
            </button>
          ) : (
            <button
              onClick={() => signOut()}
              className="px-4 py-2 bg-black text-white/70 rounded-full hover:bg-white/10 transition-opacity border border-white/20 text-sm focus:outline-none focus:ring-2 focus:ring-white/50"
              aria-label="Sign out"
            >
              Sign Out
            </button>
          )}
        </div>
      </header>

      {/* Messages Container */}
      <main className="relative z-10 flex-1 overflow-y-auto px-4 sm:px-6 py-4">
        {showWelcome && messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center animate-fadeIn">
            <div className="relative mb-6">
              <div className="w-20 h-20 bg-black rounded-full flex items-center justify-center border border-white/20">
                <Users className="w-10 h-10 text-white/70" />
              </div>
              <div className="absolute -top-2 -right-2 w-5 h-5 bg-white rounded-full border border-black animate-pulse"></div>
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">Welcome to SChat</h2>
            <p className="text-white/70 text-base max-w-md leading-relaxed mb-4">
              Connect globally in real-time. Messages vanish, leaving no trace—just pure, ephemeral conversation.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mb-6">
              <div className="bg-black/50 backdrop-blur-sm border border-white/20 rounded-lg p-3 text-center">
                <Zap className="w-4 h-4 text-white mx-auto mb-1" />
                <div className="text-white text-sm font-medium">Instant</div>
                <div className="text-white/50 text-xs">Real-time chat</div>
              </div>
              <div className="bg-black/50 backdrop-blur-sm border border-white/20 rounded-lg p-3 text-center">
                <Shield className="w-4 h-4 text-white mx-auto mb-1" />
                <div className="text-white text-sm font-medium">Ephemeral</div>
                <div className="text-white/50 text-xs">No history</div>
              </div>
              <div className="bg-black/50 backdrop-blur-sm border border-white/20 rounded-lg p-3 text-center">
                <Globe className="w-4 h-4 text-white mx-auto mb-1" />
                <div className="text-white text-sm font-medium">Global</div>
                <div className="text-white/50 text-xs">Worldwide</div>
              </div>
            </div>
            <p className="text-white/50 text-sm">Start typing to join the conversation...</p>
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((msg, index) => {
              const isMine = isMyMessage(msg.name);
              const showName = index === 0 || messages[index - 1].name !== msg.name;

              return (
                <div
                  key={msg.id || index}
                  className={`flex ${isMine ? 'justify-end' : 'justify-start'} animate-[fadeInUp_0.3s_ease-out]`}
                >
                  <div className={`max-w-xs sm:max-w-md ${isMine ? 'order-2' : 'order-1'}`}>
                    {!isMine && showName && (
                      <div className="flex items-center space-x-2 mb-1.5">
                        <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center border border-white/20">
                          <span className="text-xs font-bold text-white">
                            {msg.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <span className="text-sm font-medium text-white/70">{msg.name}</span>
                        <span className="text-xs text-white/50">{getRelativeTime(msg.timestamp)}</span>
                      </div>
                    )}
                    <div
                      className={`px-4 py-2.5 rounded-2xl backdrop-blur-sm transition-all duration-200 ${
                        isMine
                          ? 'bg-white text-black ml-6'
                          : 'bg-black/70 text-white border border-white/20'
                      }`}
                    >
                      <div className="break-words text-sm leading-relaxed">{msg.message}</div>
                      {isMine && (
                        <div className="text-xs text-black/70 mt-1 text-right">
                          {getRelativeTime(msg.timestamp)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </main>

      {/* Typing Indicator */}
      {isTyping && (
        <div className="relative z-10 px-4 sm:px-6 py-2 bg-black/50">
          <div className="flex items-center space-x-2 text-white/70">
            <div className="flex space-x-1">
              <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce"></div>
              <div
                className="w-1.5 h-1.5 bg-white rounded-full animate-bounce"
                style={{ animationDelay: '0.1s' }}
              ></div>
              <div
                className="w-1.5 h-1.5 bg-white rounded-full animate-bounce"
                style={{ animationDelay: '0.2s' }}
              ></div>
            </div>
            <span className="text-xs">Someone is typing...</span>
          </div>
        </div>
      )}

      {/* Input Area */}
      <footer className="relative z-10 bg-black/80 backdrop-blur-md border-t border-white/20 px-4 sm:px-6 py-4">
        <div className="flex items-center space-x-3">
          <div className="flex-1 relative">
            <div className="bg-black/50 backdrop-blur-sm rounded-full border border-white/20 focus-within:border-white/50 focus-within:ring-2 focus-within:ring-white/30 transition-all duration-200">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value.slice(0, maxLength))}
                onKeyPress={handleKeyPress}
                className="w-full bg-transparent text-white placeholder-white/50 px-5 py-3 focus:outline-none text-sm sm:text-base"
                placeholder="Type a message..."
                disabled={connectionStatus !== 'Connected'}
                aria-label="Message input"
              />
            </div>
            <div className="flex justify-between items-center mt-1.5 text-xs text-white/50">
              <span>
                {connectionStatus !== 'Connected' && (
                  <span className="text-white/50">Reconnecting...</span>
                )}
              </span>
              <span className={input.length > maxLength * 0.9 ? 'text-white' : 'text-white/50'}>
                {input.length}/{maxLength}
              </span>
            </div>
          </div>
          <button
            onClick={sendMessage}
            disabled={!input.trim() || connectionStatus !== 'Connected' || input.length > maxLength}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 ${
              input.trim() && connectionStatus === 'Connected' && input.length <= maxLength
                ? 'bg-white text-black hover:bg-white/80 focus:ring-2 focus:ring-white/50 focus:outline-none'
                : 'bg-black/50 text-white/50 cursor-not-allowed'
            }`}
            aria-label="Send message"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </footer>

      <style jsx global>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
      `}</style>
    </div>
  );
}