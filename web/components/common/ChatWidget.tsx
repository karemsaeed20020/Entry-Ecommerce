"use client";

import React, { useState, useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { MessageSquare, Send, X, Minus, Maximize2, User } from "lucide-react";
import { useUserStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { toast } from "sonner";
import Cookies from "js-cookie";

interface Message {
  _id: string;
  sender: string;
  text: string;
  createdAt: string;
}

interface ChatWidgetProps {
  sellerId?: string;
  sellerName?: string;
  sellerAvatar?: string;
  forceOpen?: boolean;
  onToggle?: (open: boolean) => void;
}

const ChatWidget: React.FC<ChatWidgetProps> = ({
  sellerId,
  sellerName,
  sellerAvatar,
  forceOpen = false,
  onToggle,
}) => {
  const { authUser, isAuthenticated } = useUserStore();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Initialize socket and fetch conversation
  useEffect(() => {
    if (forceOpen) {
      setIsOpen(true);
      setIsMinimized(false);
    }
  }, [forceOpen]);

  useEffect(() => {
    if (onToggle) {
      onToggle(isOpen);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && isAuthenticated && sellerId && !socketRef.current) {
      initChat();
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [isOpen, isAuthenticated, sellerId]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isMinimized]);

  const initChat = async () => {
    setLoading(true);
    try {
      const token = Cookies.get("auth_token");

      // 1. Get or Create Conversation
      const convRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/chat/conversation`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ participantId: sellerId }),
        },
      );

      const convData = await convRes.json();
      if (convData.success) {
        const cId = convData.data._id;
        setConversationId(cId);

        // 2. Fetch Messages
        const msgRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/chat/messages/${cId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        const msgData = await msgRes.json();
        if (msgData.success) {
          setMessages(msgData.data);
        }

        // 3. Connect Socket
        const socket = io(process.env.NEXT_PUBLIC_API_URL as string, {
          withCredentials: true,
        });

        socket.emit("join_room", cId);

        socket.on("receive_message", (message: Message) => {
          setMessages((prev) => [...prev, message]);
        });

        socketRef.current = socket;
      }
    } catch (error) {
      console.error("Failed to init chat:", error);
      toast.error("Failed to connect to chat");
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !socketRef.current || !conversationId) return;

    const messageData = {
      conversationId,
      senderId: authUser?._id,
      text: inputText.trim(),
    };

    socketRef.current.emit("send_message", messageData);
    setInputText("");
  };

  if (!isAuthenticated || !sellerId) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end">
      {/* Chat Window */}
      {isOpen && (
        <div
          className={cn(
            "bg-white rounded-[2rem] shadow-2xl border border-slate-100 overflow-hidden transition-all duration-300 mb-4 flex flex-col",
            isMinimized
              ? "h-16 w-64"
              : "h-[500px] w-[380px] max-w-[calc(100vw-48px)]",
          )}
        >
          {/* Header */}
          <div className="bg-[#1a1a2c] p-4 flex items-center justify-between text-white shrink-0">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-white/10 overflow-hidden flex items-center justify-center border border-white/10">
                {sellerAvatar ? (
                  <Image
                    src={sellerAvatar}
                    alt="avatar"
                    width={32}
                    height={32}
                    className="object-cover"
                  />
                ) : (
                  <User className="h-4 w-4 text-white/40" />
                )}
              </div>
              <div>
                <p className="text-xs font-black truncate max-w-[150px]">
                  {sellerName || "Seller"}
                </p>
                <div className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] font-bold text-white/50 uppercase tracking-widest">
                    Online
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="h-8 w-8 flex items-center justify-center hover:bg-white/10 rounded-xl transition-colors"
              >
                {isMinimized ? (
                  <Maximize2 className="h-4 w-4" />
                ) : (
                  <Minus className="h-4 w-4" />
                )}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="h-8 w-8 flex items-center justify-center hover:bg-red-500 rounded-xl transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Messages Area */}
              <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50 custom-scrollbar"
              >
                {loading ? (
                  <div className="flex flex-col items-center justify-center h-full gap-3 opacity-30">
                    <div className="h-6 w-6 border-2 border-slate-300 border-t-[#d52245] rounded-full animate-spin" />
                    <p className="text-[10px] font-black uppercase tracking-widest">
                      Connecting...
                    </p>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center p-6 opacity-30">
                    <MessageSquare className="h-10 w-10 mb-4" />
                    <p className="text-[10px] font-black uppercase tracking-widest leading-relaxed">
                      Start a conversation with
                      <br />
                      {sellerName || "this seller"}
                    </p>
                  </div>
                ) : (
                  messages.map((msg, idx) => {
                    const isMe = msg.sender === authUser?._id;
                    return (
                      <div
                        key={msg._id || idx}
                        className={cn(
                          "flex",
                          isMe ? "justify-end" : "justify-start",
                        )}
                      >
                        <div
                          className={cn(
                            "max-w-[80%] p-3 rounded-2xl text-sm font-bold shadow-sm",
                            isMe
                              ? "bg-[#d52245] text-white rounded-tr-none"
                              : "bg-white text-slate-700 border border-slate-100 rounded-tl-none",
                          )}
                        >
                          {msg.text}
                          <p
                            className={cn(
                              "text-[9px] mt-1 opacity-50",
                              isMe ? "text-right" : "text-left",
                            )}
                          >
                            {new Date(msg.createdAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Input Area */}
              <form
                onSubmit={handleSendMessage}
                className="p-4 bg-white border-t border-slate-100 flex gap-2"
              >
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 bg-slate-50 border-none rounded-xl px-4 py-2 text-sm font-bold focus:ring-2 focus:ring-[#d52245]/20 focus:outline-none transition-all"
                />
                <button
                  type="submit"
                  disabled={!inputText.trim()}
                  className="h-10 w-10 bg-[#1a1a2c] text-white rounded-xl flex items-center justify-center hover:bg-[#d52245] disabled:opacity-50 disabled:hover:bg-[#1a1a2c] transition-all"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </>
          )}
        </div>
      )}

      {/* Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="h-14 w-14 bg-[#1a1a2c] text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 hover:bg-[#d52245] transition-all group relative"
        >
          <MessageSquare className="h-6 w-6 group-hover:rotate-12 transition-transform" />
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#d52245] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-[#d52245] border-2 border-white"></span>
          </span>
        </button>
      )}
    </div>
  );
};

export default ChatWidget;
