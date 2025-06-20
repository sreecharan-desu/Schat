/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { MessageCircle, Zap, Shield, Globe, ArrowRight, Play, Pause } from 'lucide-react';
import { Footer } from '@/app/components/Footer';

export default function Home() {
  const [typedText, setTypedText] = useState('');
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [isTyping, ] = useState(true);
  const [onlineCount, setOnlineCount] = useState(0); // Changed to 0 to reflect real count

  const fullText = "Real-time. No history. Just now.";
  const messages = [
    { user: "digital-nomad", text: "Anyone here from Tokyo? 🗾", delay: 0 },
    { user: "night-owl", text: "Berlin checking in! 3AM coffee run ☕", delay: 2000 },
    { user: "crypto-whale", text: "Market's going crazy tonight 📈", delay: 4000 },
    { user: "zen-master", text: "Sometimes silence speaks loudest...", delay: 6000 },
    { user: "pixel-artist", text: "Just dropped my latest NFT collection ✨", delay: 8000 },
    { user: "code-ninja", text: "Debugging at 2AM hits different 💻", delay: 10000 }
  ];

  const [visibleMessages, setVisibleMessages] = useState<Array<{ user: string; text: string; delay: number }>>([]);
  const [isPlaying, setIsPlaying] = useState(true);

  // Typewriter effect
  useEffect(() => {
    if (typedText.length < fullText.length) {
      const timer = setTimeout(() => {
        setTypedText(fullText.slice(0, typedText.length + 1));
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [typedText]);

  // Animated messages
  useEffect(() => {
    if (!isPlaying) return;

    const timer = setTimeout(() => {
      if (currentMessageIndex < messages.length) {
        setVisibleMessages(prev => [...prev, messages[currentMessageIndex]]);
        setCurrentMessageIndex(prev => prev + 1);
      } else {
        // Reset after showing all messages
        setTimeout(() => {
          setVisibleMessages([]);
          setCurrentMessageIndex(0);
        }, 3000);
      }
    }, messages[currentMessageIndex]?.delay || 2000);

    return () => clearTimeout(timer);
  }, [currentMessageIndex, isPlaying, messages]);

  // Counter animations - Updated to reflect real online count from WebSocket
  useEffect(() => {
    const ws = new WebSocket(process.env.NEXT_PUBLIC_WEBSOCKET_URL || 'ws://localhost:8080');
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.onlineUsers !== undefined) {
        setOnlineCount(data.onlineUsers);
      }
    };
    return () => ws.close();
  }, []);

  const features = [
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Lightning Fast",
      desc: "Messages appear instantly"
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "No Traces",
      desc: "Ephemeral by design"
    },
    {
      icon: <Globe className="w-6 h-6" />,
      title: "Global Network",
      desc: "Connect worldwide"
    }
  ];

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Animated background grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px] animate-pulse"></div>
      
      {/* Floating particles */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white opacity-20 rounded-full animate-bounce"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center p-6">
        <div className="flex flex-col lg:flex-row items-center justify-between w-full max-w-7xl gap-16">
          
          {/* Left Content */}
          <div className="flex-1 text-center lg:text-left space-y-10">
            {/* Main Title with Gradient */}
            <div className="space-y-6">
              <div className="inline-flex items-center bg-zinc-900 border border-zinc-800 rounded-full px-4 py-2 mb-6">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse mr-3"></div>
                <span className="text-sm text-zinc-300">
                  <span className="text-green-400 font-mono">{onlineCount.toLocaleString()}</span> people online now
                </span>
              </div>
              
              <h1 className="text-8xl lg:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-300 to-zinc-500 tracking-tighter leading-none">
                SChat
              </h1>
              
              <div className="h-8 flex items-center justify-center lg:justify-start">
                <p className="text-2xl lg:text-3xl text-zinc-300 font-light">
                  {typedText}
                  <span className="animate-blink text-white">|</span>
                </p>
              </div>
            </div>

            {/* Description */}
            <p className="text-zinc-400 text-lg lg:text-xl leading-relaxed max-w-xl mx-auto lg:mx-0">
              Step into the void where conversations live and die in real-time. No archives, no history, no traces. 
              <span className="text-white font-medium"> Just pure, unfiltered human connection.</span>
            </p>

            {/* Feature Grid */}
            <div className="grid grid-cols-3 gap-4 max-w-md mx-auto lg:mx-0">
              {features.map((feature, index) => (
                <div key={index} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-center hover:border-zinc-700 transition-colors group">
                  <div className="text-zinc-400 group-hover:text-white transition-colors mb-2 flex justify-center">
                    {feature.icon}
                  </div>
                  <div className="text-white text-sm font-medium mb-1">{feature.title}</div>
                  <div className="text-zinc-500 text-xs">{feature.desc}</div>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-center lg:justify-start">
              <Link href="/chat">
                <button className="group relative px-8 py-4 bg-white text-black font-semibold rounded-full overflow-hidden transition-all duration-300 ease-out hover:scale-105 hover:shadow-[0_0_30px_rgba(255,255,255,0.3)]">
                  <span className="relative z-10 flex items-center gap-2">
                    Enter the Void
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-white to-zinc-200 translate-x-full group-hover:translate-x-0 transition-transform duration-300"></div>
                </button>
              </Link>
              
              <button
                onClick={() => signIn('google')}
                className="px-8 py-4 bg-transparent border-2 border-zinc-700 text-white font-semibold rounded-full hover:border-zinc-500 hover:bg-zinc-900 transition-all duration-300 ease-out hover:scale-105 flex items-center gap-2"
              >
                <div className="w-5 h-5 bg-white rounded-sm flex items-center justify-center">
                  <span className="text-black text-xs font-bold">G</span>
                </div>
                Continue with Google
              </button>
            </div>
          </div>

          {/* Right Content - Live Chat Preview */}
          <div className="hidden md:block lg:block flex-1 max-w-lg w-full">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl">
              {/* Chat Header */}
              <div className="bg-zinc-800 border-b border-zinc-700 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-zinc-700 rounded-full flex items-center justify-center">
                    <MessageCircle className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <div className="text-white font-medium">Global Chat</div>
                    <div className="text-zinc-400 text-sm flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      Live preview
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="text-zinc-400 hover:text-white transition-colors"
                >
                  {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                </button>
              </div>

              {/* Messages */}
              <div className="h-80 p-6 space-y-3 overflow-hidden">
                {visibleMessages.map((msg:any, index) => (
                  <div
                    key={index}
                    className="opacity-0 animate-[fadeInUp_0.5s_ease-out_forwards] bg-zinc-800 rounded-2xl p-4 border border-zinc-700"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 bg-gradient-to-br from-zinc-600 to-zinc-700 rounded-full flex items-center justify-center">
                        <span className="text-xs font-bold text-white">
                          {msg.user.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <span className="text-zinc-400 text-sm font-medium">{msg.user}</span>
                      <span className="text-zinc-600 text-xs">now</span>
                    </div>
                    <p className="text-white">{msg.text}</p>
                  </div>
                ))}
                
                {/* Typing indicator */}
                {isTyping && visibleMessages.length > 0 && (
                  <div className="flex items-center gap-2 text-zinc-500 text-sm">
                    <div className="flex gap-1">
                      <div className="w-1 h-1 bg-zinc-500 rounded-full animate-bounce"></div>
                      <div className="w-1 h-1 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-1 h-1 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    <span>Someone is typing...</span>
                  </div>
                )}
              </div>

              {/* Input Preview */}
              <div className="border-t border-zinc-700 p-4">
                <div className="bg-zinc-800 rounded-full px-4 py-2 flex items-center justify-between">
                  <span className="text-zinc-500 text-sm">Join to start chatting...</span>
                  <div className="w-8 h-8 bg-zinc-700 rounded-full flex items-center justify-center">
                    <ArrowRight className="w-4 h-4 text-zinc-500" />
                  </div>
                </div>
              </div>
            </div>
            

          </div>

        </div>
      </div>
                            <div className='flex justiy-center items-center text-zinc-500 text-sm mt-4 lg:mt-0'>
                                      <Footer />

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
        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }
        .animate-blink {
          animation: blink 1s infinite;
        }
      `}</style>
    </div>
  );
}