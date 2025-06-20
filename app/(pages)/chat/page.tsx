"use client";
import { useState, useEffect, useRef } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import { uniqueNamesGenerator, adjectives, animals } from 'unique-names-generator';
import { Send, Users, Wifi, WifiOff, ArrowLeft, Zap, Globe, Shield } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Message {
  name: string;
  message: string;
  timestamp?: number;
  id?: string;
  onlineUsers?: number; // Added to handle online users count
}

export default function Chat() {
  const { data: session } = useSession();
  const [name, setName] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState<string>('');
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<string>('Connecting...');
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [onlineUsers, setOnlineUsers] = useState<number>(0); // Changed to 0 to reflect real count
  const [messageCount, setMessageCount] = useState<number>(89563);
  const [showWelcome, setShowWelcome] = useState<boolean>(true);
  const maxLength = 280;
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const router = useRouter()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
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


  // Simulate dynamic counters
  useEffect(() => {
    const interval = setInterval(() => {
      setMessageCount(prev => prev + Math.floor(Math.random() * 3));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const socket = new WebSocket(process.env.NEXT_PUBLIC_WEBSOCKET_URL || 'ws://localhost:8080');
    socket.onopen = () => {
      setConnectionStatus('Connected');
      console.log('Connected to WebSocket');
    };
    socket.onmessage = (event) => {
      try {
        const data: Message = JSON.parse(event.data);
        if (data.name && data.message) {
          const messageWithTimestamp = {
            ...data,
            timestamp: Date.now(),
            id: Math.random().toString(36).substr(2, 9)
          };
          setMessages((prev) => [...prev, messageWithTimestamp]);
          setShowWelcome(false);
          
          // Simulate typing indicator
          if (data.name !== name) {
            setIsTyping(true);
            setTimeout(() => setIsTyping(false), 2000);
          }
        }
        // Update online users count
        if (data.onlineUsers !== undefined) {
          setOnlineUsers(data.onlineUsers);
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };
    socket.onerror = () => {
      setConnectionStatus('Error connecting to server');
      console.error('WebSocket error');
    };
    socket.onclose = () => {
      setConnectionStatus('Disconnected');
      console.log('WebSocket closed');
    };
    setWs(socket);
    return () => socket.close();
  }, [name]);

  const sendMessage = () => {
    if (!input.trim() || !ws || input.length > maxLength) return;
    const message: Message = { 
      name, 
      message: input,
      timestamp: Date.now(),
      id: Math.random().toString(36).substr(2, 9)
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
    <div className="h-screen bg-black flex flex-col relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:40px_40px] opacity-50"></div>
      
      {/* Floating particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute w-0.5 h-0.5 bg-white opacity-10 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      {/* Header */}
      <div className="relative z-10 bg-zinc-900 border-b border-zinc-800 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button onClick={()=>router.push('/')} className="lg:hidden text-zinc-400 hover:text-white transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-zinc-700 to-zinc-800 rounded-full flex items-center justify-center border-2 border-zinc-600">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-zinc-900 animate-pulse"></div>
            </div>
            <div>
              <h1 className="text-white font-bold text-xl tracking-tight">SChat</h1>
              <div className="flex items-center space-x-3 mt-1">
                <div className="flex items-center space-x-1">
                  {connectionStatus === 'Connected' ? (
                    <Wifi className="w-3 h-3 text-green-400" />
                  ) : (
                    <WifiOff className="w-3 h-3 text-red-400" />
                  )}
                  <span className={`text-xs font-medium ${connectionStatus === 'Connected' ? 'text-green-400' : 'text-red-400'}`}>
                    {connectionStatus}
                  </span>
                </div>
                <span className="text-xs text-zinc-500">•</span>
                <span className="text-xs text-zinc-400 font-mono">
                  <span className="text-green-400">{onlineUsers.toLocaleString()}</span> online
                </span>
                <span className="hidden text-xs text-zinc-400 font-mono">
                  {messageCount.toLocaleString()} today
                </span>
              </div>
            </div>
          </div>
       <div className="hidden items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-white to-zinc-300 rounded-full flex items-center justify-center">
              <span className="text-sm font-bold text-black">{name.charAt(0).toUpperCase()}</span>
            </div>
            <div>
              <span className="text-sm text-zinc-300">
                Connected as <span className="font-semibold text-white">{name}</span>
              </span>
              <div className="flex items-center space-x-2 mt-0.5">
                <div className="flex items-center space-x-1">
                  <Shield className="w-3 h-3 text-zinc-500" />
                  <span className="text-xs text-zinc-500">Ephemeral</span>
                </div>
                <span className="text-xs text-zinc-600">•</span>
                <div className="flex items-center space-x-1">
                  <Globe className="w-3 h-3 text-zinc-500" />
                  <span className="text-xs text-zinc-500">Global</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* User Info Bar */}
      <div className="relative z-10 bg-zinc-900 border-b border-zinc-800 px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-white to-zinc-300 rounded-full flex items-center justify-center">
              <span className="text-sm font-bold text-black">{name.charAt(0).toUpperCase()}</span>
            </div>
            <div>
              <span className="text-sm text-zinc-300">
                Connected as <span className="font-semibold text-white">{name}</span>
              </span>
              <div className="flex items-center space-x-2 mt-0.5">
                <div className="flex items-center space-x-1">
                  <Shield className="w-3 h-3 text-zinc-500" />
                  <span className="text-xs text-zinc-500">Ephemeral</span>
                </div>
                <span className="text-xs text-zinc-600">•</span>
                <div className="flex items-center space-x-1">
                  <Globe className="w-3 h-3 text-zinc-500" />
                  <span className="text-xs text-zinc-500">Global</span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            {!session ? (
              <button
                onClick={() => signIn('google')}
                className="text-xs px-4 py-2 bg-white text-black rounded-full hover:bg-zinc-200 transition-all duration-200 font-semibold hover:scale-105"
              >
                Sign In
              </button>
            ) : (
              <button
                onClick={() => signOut()}
                className="text-xs px-4 py-2 bg-zinc-800 text-zinc-300 rounded-full hover:bg-zinc-700 transition-all duration-200 border border-zinc-700 hover:border-zinc-600"
              >
                Sign Out
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div className="relative z-10 flex-1 overflow-y-auto bg-black px-6 py-4">
        {showWelcome && messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="relative mb-8">
              <div className="w-24 h-24 bg-gradient-to-br from-zinc-800 to-zinc-900 rounded-full flex items-center justify-center border border-zinc-700">
                <Users className="w-12 h-12 text-zinc-400" />
              </div>
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-400 rounded-full border-2 border-black animate-pulse"></div>
            </div>
            
            <h2 className="text-2xl font-bold text-white mb-4">Welcome to the Void</h2>
            <p className="text-zinc-400 text-lg mb-6 max-w-md leading-relaxed">
              You &apos; ve entered SChat Global — where conversations live and die in real-time. <br />
              <span className="text-white font-medium"> No history, no traces, just pure connection.</span>
            </p>
            
            <div className="hidden grid-cols-1 sm:grid-cols-3 gap-4 mb-8 max-w-md">
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-center">
                <Zap className="w-5 h-5 text-yellow-400 mx-auto mb-2" />
                <div className="text-white text-sm font-medium">Instant</div>
                <div className="text-zinc-500 text-xs">Real-time chat</div>
              </div>
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-center">
                <Shield className="w-5 h-5 text-blue-400 mx-auto mb-2" />
                <div className="text-white text-sm font-medium">Ephemeral</div>
                <div className="text-zinc-500 text-xs">No history</div>
              </div>
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-center">
                <Globe className="w-5 h-5 text-green-400 mx-auto mb-2" />
                <div className="text-white text-sm font-medium">Global</div>
                <div className="text-zinc-500 text-xs">Worldwide</div>
              </div>
            </div>
            
            <p className="text-zinc-500 text-sm">
              Send your first message to break the silence...
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg, index) => {
              const isMine = isMyMessage(msg.name);
              const showName = index === 0 || messages[index - 1].name !== msg.name;
              
              return (
                <div
                  key={msg.id || index}
                  className={`flex ${isMine ? 'justify-end' : 'justify-start'} animate-[fadeInUp_0.3s_ease-out]`}
                >
                  <div className={`max-w-xs lg:max-w-md ${isMine ? 'order-2' : 'order-1'}`}>
                    {!isMine && showName && (
                      <div className="flex items-center space-x-2 mb-2 px-4">
                        <div className="w-5 h-5 bg-gradient-to-br from-zinc-600 to-zinc-700 rounded-full flex items-center justify-center">
                          <span className="text-xs font-bold text-white">
                            {msg.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <span className="text-xs font-medium text-zinc-400">{msg.name}</span>
                        <span className="text-xs text-zinc-600">{getRelativeTime(msg.timestamp)}</span>
                      </div>
                    )}
                    <div className={`px-6 py-4 rounded-3xl shadow-lg backdrop-blur-sm ${
                      isMine 
                        ? 'bg-white text-black rounded-br-lg ml-12' 
                        : 'bg-zinc-800 text-white rounded-bl-lg border border-zinc-700'
                    }`}>
                      <div className="break-words leading-relaxed">{msg.message}</div>
                      {isMine && (
                        <div className="text-xs text-zinc-600 mt-2 text-right">
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
      </div>

      {/* Typing Indicator */}
      {isTyping && (
        <div className="relative z-10 px-6 py-2">
          <div className="flex items-center space-x-3 text-zinc-500">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
            <span className="text-sm">Someone is crafting a message...</span>
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="relative z-10 bg-zinc-900 border-t border-zinc-800 p-6">
        <div className="flex items-end space-x-4">
          <div className="flex-1 relative">
            <div className="bg-zinc-800 rounded-3xl border border-zinc-700 focus-within:border-zinc-600 focus-within:shadow-lg focus-within:shadow-zinc-900/50 transition-all duration-200">
              <div className="flex items-center">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value.slice(0, maxLength))}
                  onKeyPress={handleKeyPress}
                  className="flex-1 bg-transparent text-white placeholder-zinc-500 px-6 py-4 focus:outline-none text-lg"
                  placeholder="Send a message into the void..."
                  disabled={connectionStatus !== 'Connected'}
                />
       
              </div>
            </div>
            <div className="flex justify-between items-center mt-2 px-2">
              <span className="text-xs text-zinc-600">
                {connectionStatus !== 'Connected' && (
                  <span className="text-red-400">Reconnecting...</span>
                )}
              </span>
              <span className={`text-xs font-mono ${input.length > maxLength * 0.9 ? 'text-red-400' : 'text-zinc-500'}`}>
                {input.length}/{maxLength}
              </span>
            </div>
          </div>
          
          <button
            onClick={sendMessage}
            disabled={!input.trim() || connectionStatus !== 'Connected' || input.length > maxLength}
            className={`-mt-10 w-14 h-14 rounded-full flex items-center justify-center transition-all duration-200 ${
              input.trim() && connectionStatus === 'Connected' && input.length <= maxLength
                ? 'bg-white text-black hover:bg-zinc-200 shadow-lg hover:shadow-xl transform hover:scale-105 hover:shadow-white/20' 
                : 'bg-zinc-700 text-zinc-500 cursor-not-allowed'
            }`}
          >
            <Send className="w-6 h-6" />
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}