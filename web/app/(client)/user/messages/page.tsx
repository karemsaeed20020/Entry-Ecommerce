"use client";

import React, { useState, useEffect, useRef } from "react";
import { useUserStore } from "@/lib/store";
import { io, Socket } from "socket.io-client";
import { MessageSquare, Send, User, Search, ChevronRight, Clock, Headset } from "lucide-react";
import Cookies from "js-cookie";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import Container from "@/components/common/Container";

interface Conversation {
  _id: string;
  participants: any[];
  lastMessage?: any;
  updatedAt: string;
}

interface Message {
  _id: string;
  conversationId: string;
  sender: string;
  text: string;
  createdAt: string;
}

export default function UserMessagesPage() {
  const { authUser, isAuthenticated } = useUserStore();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConv, setActiveConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(true);
  const [msgLoading, setMsgLoading] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Initialize socket
  useEffect(() => {
    if (!isAuthenticated) return;

    const socket = io(process.env.NEXT_PUBLIC_API_URL as string, {
      withCredentials: true,
    });
    socketRef.current = socket;

    socket.on("receive_message", (message: Message) => {
      setMessages((prev) => {
        if (message.conversationId === activeConv?._id) {
          return [...prev, message];
        }
        return prev;
      });
      fetchConversations();
    });

    return () => {
      socket.disconnect();
    };
  }, [activeConv?._id, isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchConversations();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (activeConv) {
      fetchMessages(activeConv._id);
      socketRef.current?.emit("join_room", activeConv._id);
    }
  }, [activeConv]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const fetchConversations = async () => {
    try {
      const token = Cookies.get("auth_token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/chat/conversations`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setConversations(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch conversations:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (convId: string) => {
    setMsgLoading(true);
    try {
      const token = Cookies.get("auth_token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/chat/messages/${convId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setMessages(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch messages:", error);
    } finally {
      setMsgLoading(false);
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeConv || !socketRef.current) return;

    const messageData = {
      conversationId: activeConv._id,
      senderId: authUser?._id,
      text: inputText.trim(),
    };

    socketRef.current?.emit("send_message", messageData);
    setInputText("");
  };

  const handleStartSupport = async () => {
    try {
      const token = Cookies.get("auth_token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/chat/support`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        await fetchConversations();
        setActiveConv(data.data);
      } else {
        toast.error(data.message || "Failed to start support chat");
      }
    } catch (error) {
      toast.error("An error occurred");
    }
  };

  const getParticipant = (conv: Conversation) => {
    return conv.participants.find(p => p._id !== authUser?._id);
  };

  if (!isAuthenticated) return null;

  return (
    <Container className="py-10">
      <div className="h-[calc(100vh-200px)] flex bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
        {/* Sidebar */}
        <div className="w-80 border-r border-slate-100 flex flex-col shrink-0">
          <div className="p-6 border-b border-slate-100">
            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2 mb-4">
              <MessageSquare className="h-5 w-5 text-[#d52245]" />
              My Messages
            </h1>
            <button 
              onClick={handleStartSupport}
              className="w-full mb-4 py-2 px-4 bg-[#1a1a2c] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 hover:bg-[#d52245] transition-all"
            >
              <Headset className="h-4 w-4" />
              Chat with Support
            </button>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search..." 
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-[#d52245]/20 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {loading ? (
              <div className="p-8 text-center space-y-3 opacity-30">
                <div className="h-6 w-6 border-2 border-slate-300 border-t-[#d52245] rounded-full animate-spin mx-auto" />
                <p className="text-xs font-bold uppercase tracking-widest">Loading...</p>
              </div>
            ) : conversations.length === 0 ? (
              <div className="p-8 text-center opacity-30">
                <p className="text-sm font-medium">No messages yet</p>
              </div>
            ) : (
              conversations.map((conv) => {
                const other = getParticipant(conv);
                const isActive = activeConv?._id === conv._id;
                return (
                  <button
                    key={conv._id}
                    onClick={() => setActiveConv(conv)}
                    className={cn(
                      "w-full p-4 flex items-center gap-3 transition-all border-l-4",
                      isActive 
                        ? "bg-slate-50 border-[#d52245]" 
                        : "border-transparent hover:bg-slate-50/50"
                    )}
                  >
                    <div className="h-12 w-12 rounded-full bg-slate-100 shrink-0 overflow-hidden flex items-center justify-center border-2 border-white shadow-sm">
                      {other?.avatar ? (
                        <img src={other.avatar} alt="avatar" className="h-full w-full object-cover" />
                      ) : (
                        <User className="h-6 w-6 text-slate-300" />
                      )}
                    </div>
                    <div className="flex-1 text-left min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-0.5">
                        <p className={cn("text-sm font-bold truncate", isActive ? "text-slate-900" : "text-slate-600")}>
                          {other?.name || "Support/Seller"}
                        </p>
                        <span className="text-[10px] text-slate-400">
                          {new Date(conv.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 truncate">
                        {conv.lastMessage?.text || "Started a conversation"}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-slate-50/20">
          {activeConv ? (
            <>
              <div className="p-4 bg-white border-b border-slate-100 flex items-center gap-3 shadow-sm">
                <div className="h-10 w-10 rounded-full bg-slate-100 overflow-hidden flex items-center justify-center">
                  {getParticipant(activeConv)?.avatar ? (
                    <img src={getParticipant(activeConv).avatar} alt="avatar" className="h-full w-full object-cover" />
                  ) : (
                    <User className="h-5 w-5 text-slate-300" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">{getParticipant(activeConv)?.name}</p>
                  <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-wider">Online</p>
                </div>
              </div>

              <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                {msgLoading ? (
                  <div className="flex items-center justify-center h-full opacity-30">
                    <div className="h-8 w-8 border-2 border-slate-300 border-t-[#d52245] rounded-full animate-spin" />
                  </div>
                ) : (
                  messages.map((msg, idx) => {
                    const isMe = msg.sender === authUser?._id;
                    return (
                      <div key={msg._id || idx} className={cn("flex", isMe ? "justify-end" : "justify-start")}>
                        <div 
                          className={cn(
                            "max-w-[70%] p-3 rounded-2xl text-sm font-medium shadow-sm",
                            isMe 
                              ? "bg-[#1a1a2c] text-white rounded-tr-none" 
                              : "bg-white text-slate-700 border border-slate-100 rounded-tl-none"
                          )}
                        >
                          {msg.text}
                          <p className={cn("text-[9px] mt-1 opacity-50", isMe ? "text-right" : "text-left")}>
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              <div className="p-4 bg-white border-t border-slate-100">
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <input 
                    type="text" 
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 h-12 bg-slate-50 border-none rounded-xl px-4 text-sm focus:ring-2 focus:ring-[#d52245]/20 focus:outline-none"
                  />
                  <button 
                    type="submit"
                    disabled={!inputText.trim()}
                    className="h-12 w-12 bg-[#1a1a2c] text-white rounded-xl flex items-center justify-center hover:bg-[#d52245] transition-all disabled:opacity-50 shadow-lg"
                  >
                    <Send className="h-5 w-5" />
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-12 opacity-30">
              <MessageSquare className="h-16 w-16 text-slate-200 mb-4" />
              <h2 className="text-xl font-bold text-slate-900">Select a Chat</h2>
              <p className="text-sm text-slate-400 mt-2">Choose a contact to start chatting</p>
            </div>
          )}
        </div>
      </div>
    </Container>
  );
}
