"use client";
import { useEffect, useState } from "react";
import { 
  Bell, 
  Check, 
  Trash2, 
  Clock, 
  ExternalLink,
  Inbox,
  AlertCircle
} from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import notificationApi, { Notification } from "@/lib/notificationApi";
import { useUserStore } from "@/lib/store";
import Container from "@/components/common/Container";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";

export default function UserNotificationsPage() {
  const { auth_token } = useUserStore();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const fetchNotifications = async () => {
    if (!auth_token) return;
    try {
      setLoading(true);
      const response = await notificationApi.getNotifications(1, 50, filter === "unread");
      if (response.success) {
        setNotifications(response.notifications || []);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [auth_token, filter]);

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationApi.markAsRead(id);
      setNotifications(prev => 
        prev.map(n => n._id === id ? { ...n, isRead: true } : n)
      );
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationApi.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await notificationApi.deleteNotification(id);
      setNotifications(prev => prev.filter(n => n._id !== id));
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  if (!hasMounted) return null;

  if (!auth_token) {
    return (
      <Container className="py-20">
        <div className="max-w-md mx-auto text-center">
          <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Please Login</h1>
          <p className="text-muted-foreground mb-6">You need to be logged in to view your notifications.</p>
          <Button asChild>
            <Link href="/login">Login Now</Link>
          </Button>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Your Notifications</h1>
          <p className="text-muted-foreground mt-1">Stay updated with your orders, reviews, and more.</p>
        </div>
        <Button 
          variant="outline" 
          onClick={handleMarkAllAsRead}
          disabled={!notifications.some(n => !n.isRead)}
          className="hover:bg-red-50 hover:text-[#d52245] transition-colors"
        >
          <Check className="mr-2 h-4 w-4" />
          Mark all as read
        </Button>
      </div>

      <Card className="border-none shadow-sm bg-slate-50/50">
        <CardContent className="p-0">
          <Tabs defaultValue="all" onValueChange={setFilter} className="w-full">
            <div className="px-6 border-b bg-white rounded-t-xl">
              <TabsList className="bg-transparent border-b-0 h-14 p-0 gap-8">
                <TabsTrigger 
                  value="all" 
                  className="rounded-none border-b-2 border-transparent data-[state=active]:bg-white data-[state=active]:text-[#d52245] px-0 h-full font-semibold"
                >
                  All Notifications
                </TabsTrigger>
                <TabsTrigger 
                  value="unread" 
                  className="rounded-none border-b-2 border-transparent data-data-[state=active]:bg-white data-[state=active]:text-[#d52245] px-0 h-full font-semibold"
                >
                  Unread
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="bg-white rounded-b-xl min-h-[400px]">
              {loading ? (
                <div className="p-6 space-y-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex gap-4">
                      <Skeleton className="h-12 w-12 rounded-full shrink-0" />
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-4 w-1/4" />
                        <Skeleton className="h-4 w-full" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : notifications && notifications.length > 0 ? (
                <div className="divide-y divide-slate-100">
                  {notifications.map((notif) => (
                    <div 
                      key={notif._id} 
                      className={`group relative flex items-start gap-4 p-6 transition-all hover:bg-slate-50/80 ${!notif.isRead ? "bg-red-50/30" : ""}`}
                    >
                      <div className={`p-3 rounded-2xl shrink-0 ${!notif.isRead ? "bg-white shadow-sm ring-1 ring-red-100 text-[#d52245]" : "bg-slate-50 text-slate-400"}`}>
                        <Bell size={20} />
                      </div>
                      
                      <div className="flex-1 min-w-0 pr-10">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className={`font-bold text-base ${!notif.isRead ? "text-slate-900" : "text-slate-600"}`}>
                            {notif.title}
                          </h3>
                          {!notif.isRead && (
                            <span className="h-2 w-2 rounded-full bg-[#d52245] shrink-0" />
                          )}
                        </div>
                        
                        <p className={`text-sm leading-relaxed mb-3 ${!notif.isRead ? "text-slate-700" : "text-slate-500"}`}>
                          {notif.message}
                        </p>
                        
                        <div className="flex items-center gap-4">
                          <span className="text-xs text-slate-400 flex items-center gap-1.5 font-medium">
                            <Clock size={14} />
                            {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                          </span>
                          
                          {notif.actionUrl && (
                            <Link 
                              href={notif.actionUrl}
                              className="text-xs font-bold text-[#d52245] hover:text-[#b41d3a] flex items-center gap-1 transition-colors"
                            >
                              View Details
                              <ExternalLink size={12} />
                            </Link>
                          )}
                        </div>
                      </div>

                      <div className="absolute top-6 right-6 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {!notif.isRead && (
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-slate-400 hover:text-[#d52245] hover:bg-white shadow-sm"
                            onClick={() => handleMarkAsRead(notif._id)}
                            title="Mark as read"
                          >
                            <Check size={16} />
                          </Button>
                        )}
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-white shadow-sm"
                          onClick={() => handleDelete(notif._id)}
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
                  <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                    <Inbox className="w-10 h-10 text-slate-300" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Your inbox is empty</h3>
                  <p className="text-slate-500 max-w-xs mx-auto">
                    We'll notify you when something important happens.
                  </p>
                </div>
              )}
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </Container>
  );
}
