import React, { useEffect, useState, useRef } from "react";
import useAuthStore from "../../store/useAuthStore";
import { io, Socket } from "socket.io-client";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { Send, User as UserIcon } from "lucide-react";
import { adminApi } from "../../lib/api";

interface Conversation {
  _id: string;
  participants: { _id: string; name: string; avatar?: string }[];
  lastMessage?: { text: string; createdAt: string };
}

interface Message {
  _id: string;
  sender: string;
  text: string;
  createdAt: string;
}

const MessagesPage = () => {
  const { user } = useAuthStore();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize socket
    socketRef.current = io(import.meta.env.VITE_API_URL || "http://localhost:8000");

    fetchConversations();

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  useEffect(() => {
    if (selectedConversation && socketRef.current) {
      socketRef.current.emit("join_room", selectedConversation._id);
      fetchMessages(selectedConversation._id);

      socketRef.current.on("receive_message", (message: Message) => {
        setMessages((prev) => [...prev, message]);
        scrollToBottom();
      });
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.off("receive_message");
      }
    };
  }, [selectedConversation]);

  const fetchConversations = async () => {
    try {
      const res = await adminApi.get("/chat/conversations");
      setConversations(res.data.data);
    } catch (error) {
      console.error("Failed to fetch conversations", error);
    }
  };

  const fetchMessages = async (conversationId: string) => {
    try {
      const res = await adminApi.get(`/chat/messages/${conversationId}`);
      setMessages(res.data.data);
      scrollToBottom();
    } catch (error) {
      console.error("Failed to fetch messages", error);
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation || !socketRef.current) return;

    const messageData = {
      conversationId: selectedConversation._id,
      senderId: user?._id,
      text: newMessage,
    };

    socketRef.current.emit("send_message", messageData);
    setNewMessage("");
  };

  const getOtherParticipant = (conv: Conversation) => {
    return conv.participants.find((p) => p._id !== user?._id);
  };

  return (
    <div className="h-[calc(100vh-100px)] flex gap-4 p-4">
      {/* Sidebar */}
      <Card className="w-1/3 h-full flex flex-col">
        <CardHeader>
          <CardTitle>Messages</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto space-y-2 p-4">
          {conversations.map((conv) => {
            const other = getOtherParticipant(conv);
            return (
              <div
                key={conv._id}
                onClick={() => setSelectedConversation(conv)}
                className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                  selectedConversation?._id === conv._id ? "bg-primary/10" : "hover:bg-muted"
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                  <UserIcon size={20} className="text-muted-foreground" />
                </div>
                <div className="flex-1 overflow-hidden">
                  <h4 className="font-semibold text-sm truncate">{other?.name || "Unknown User"}</h4>
                  <p className="text-xs text-muted-foreground truncate">
                    {conv.lastMessage?.text || "No messages yet"}
                  </p>
                </div>
              </div>
            );
          })}
          {conversations.length === 0 && (
            <p className="text-center text-muted-foreground py-4">No conversations yet.</p>
          )}
        </CardContent>
      </Card>

      {/* Chat Area */}
      <Card className="w-2/3 h-full flex flex-col">
        {selectedConversation ? (
          <>
            <CardHeader className="border-b pb-4">
              <CardTitle className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                  <UserIcon size={16} />
                </div>
                {getOtherParticipant(selectedConversation)?.name || "Chat"}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg) => {
                const isMe = msg.sender === user?._id;
                return (
                  <div key={msg._id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[70%] rounded-lg p-3 ${
                        isMe ? "bg-primary text-primary-foreground" : "bg-muted"
                      }`}
                    >
                      <p className="text-sm">{msg.text}</p>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </CardContent>
            <div className="p-4 border-t">
              <form onSubmit={sendMessage} className="flex gap-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1"
                />
                <Button type="submit" size="icon">
                  <Send size={18} />
                </Button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            Select a conversation to start chatting
          </div>
        )}
      </Card>
    </div>
  );
};

export default MessagesPage;
