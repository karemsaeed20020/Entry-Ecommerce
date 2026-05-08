"use client";

import React, { useState, useEffect, useRef } from "react";
import { useUserStore } from "@/lib/store";
import { io, Socket } from "socket.io-client";
import { MessageSquare, Send, User, Search, ChevronRight, Clock } from "lucide-react";
import Cookies from "js-cookie";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

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

export default function SellerMessagesPage() {
  const { authUser } = useUserStore();
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
    const socket = io(process.env.NEXT_PUBLIC_API_URL as string, {
      withCredentials: true,
    });
    socketRef.current = socket;

    socket.on("receive_message", (message: Message) => {
      setMessages((prev) => {
        // Only add message if it belongs to the active conversation
        if (message.conversationId === activeConv?._id) {
          return [...prev, message];
        }
        return prev;
      });
      
      // Update conversations list to show new last message
      fetchConversations();
    });

    return () => {
      socket.disconnect();
    };
  }, [activeConv?._id]);

  // Fetch conversations on mount
  useEffect(() => {
    fetchConversations();
  }, []);

  // Fetch messages when active conversation changes
  useEffect(() => {
    if (activeConv) {
      fetchMessages(activeConv._id);
      socketRef.current?.emit("join_room", activeConv._id);
    }
  }, [activeConv]);

  // Scroll to bottom when messages change
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

    socketRef.current.emit("send_message", messageData);
    setInputText("");
  };

  const getParticipant = (conv: Conversation) => {
    return conv.participants.find(p => p._id !== authUser?._id);
  };

  return (
    <div className="h-[calc(100vh-140px)] flex bg-white rounded-[2rem] border-2 border-slate-100 shadow-xl overflow-hidden animate-in fade-in duration-500">
      {/* Sidebar: Conversation List */}
      <div className="w-80 border-r-2 border-slate-50 flex flex-col shrink-0">
        <div className="p-6 border-b-2 border-slate-50">
          <h1 className="text-xl font-black text-[#1a1a2c] flex items-center gap-2 mb-4">
            <MessageSquare className="h-5 w-5 text-[#d52245]" />
            Messages
          </h1>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search chats..." 
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border-none rounded-xl text-xs font-bold focus:ring-2 focus:ring-[#d52245]/20 focus:outline-none"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {loading ? (
            <div className="p-8 text-center space-y-3 opacity-30">
              <div className="h-6 w-6 border-2 border-slate-300 border-t-[#d52245] rounded-full animate-spin mx-auto" />
              <p className="text-[10px] font-black uppercase tracking-widest">Loading Chats...</p>
            </div>
          ) : conversations.length === 0 ? (
            <div className="p-8 text-center opacity-30">
              <p className="text-[10px] font-black uppercase tracking-widest">No conversations yet</p>
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
                      <p className={cn("text-sm font-black truncate", isActive ? "text-[#1a1a2c]" : "text-slate-600")}>
                        {other?.name || "Unknown User"}
                      </p>
                      <span className="text-[9px] font-bold text-slate-400 whitespace-nowrap">
                        {new Date(conv.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-[10px] font-bold text-slate-400 truncate opacity-70">
                      {conv.lastMessage?.text || "Started a conversation"}
                    </p>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Main: Chat History */}
      <div className="flex-1 flex flex-col bg-slate-50/30 relative">
        {activeConv ? (
          <>
            {/* Header */}
            <div className="p-4 bg-white border-b-2 border-slate-50 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-slate-100 overflow-hidden flex items-center justify-center border-2 border-white">
                  {getParticipant(activeConv)?.avatar ? (
                    <img src={getParticipant(activeConv).avatar} alt="avatar" className="h-full w-full object-cover" />
                  ) : (
                    <User className="h-5 w-5 text-slate-300" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-black text-[#1a1a2c]">{getParticipant(activeConv)?.name}</p>
                  <div className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Chat</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar"
            >
              {msgLoading ? (
                <div className="flex flex-col items-center justify-center h-full gap-3 opacity-30">
                  <div className="h-8 w-8 border-2 border-slate-300 border-t-[#d52245] rounded-full animate-spin" />
                  <p className="text-[10px] font-black uppercase tracking-widest">Loading messages...</p>
                </div>
              ) : (
                messages.map((msg, idx) => {
                  const isMe = msg.sender === authUser?._id;
                  return (
                    <div key={msg._id || idx} className={cn("flex flex-col", isMe ? "items-end" : "items-start")}>
                      <div className="flex items-center gap-2 mb-1 px-1">
                        {!isMe && <span className="text-[9px] font-black text-slate-400 uppercase">{getParticipant(activeConv)?.name}</span>}
                        <span className="text-[9px] font-bold text-slate-400">
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {isMe && <span className="text-[9px] font-black text-[#d52245] uppercase">You</span>}
                      </div>
                      <div 
                        className={cn(
                          "max-w-[70%] p-4 rounded-2xl text-sm font-bold shadow-sm transition-all",
                          isMe 
                            ? "bg-[#1a1a2c] text-white rounded-tr-none" 
                            : "bg-white text-slate-700 border-2 border-slate-100 rounded-tl-none"
                        )}
                      >
                        {msg.text}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Input */}
            <div className="p-6 bg-white border-t-2 border-slate-50">
              <form onSubmit={handleSendMessage} className="flex gap-3">
                <input 
                  type="text" 
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Write your message..."
                  className="flex-1 h-14 bg-slate-50 border-none rounded-2xl px-6 text-sm font-black focus:ring-4 focus:ring-[#d52245]/10 focus:outline-none transition-all placeholder:text-slate-300"
                />
                <button 
                  type="submit"
                  disabled={!inputText.trim()}
                  className="h-14 px-8 bg-[#1a1a2c] text-white rounded-2xl flex items-center justify-center gap-2 hover:bg-[#d52245] disabled:opacity-50 disabled:hover:bg-[#1a1a2c] transition-all shadow-lg shadow-slate-200"
                >
                  <Send className="h-5 w-5" />
                  <span className="text-xs font-black uppercase tracking-widest">Send</span>
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-12 opacity-30">
            <div className="h-24 w-24 rounded-[2rem] bg-slate-100 flex items-center justify-center mb-6">
              <MessageSquare className="h-10 w-10 text-slate-400" />
            </div>
            <h2 className="text-2xl font-black text-[#1a1a2c]">Select a Conversation</h2>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2">Choose a chat from the sidebar to start messaging</p>
          </div>
        )}
      </div>
    </div>
  );
}
