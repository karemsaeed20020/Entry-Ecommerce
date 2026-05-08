"use client";
import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import Link from "next/link";
import { useUserStore } from "@/lib/store";
import notificationApi, { Notification } from "@/lib/notificationApi";
import { io } from "socket.io-client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";

const NotificationIcon = () => {
  const { auth_token, authUser } = useUserStore();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const fetchNotifications = async () => {
    if (!auth_token) return;
    try {
      const response = await notificationApi.getNotifications(1, 5);
      if (response.success) {
        setNotifications(response.notifications || []);
        setUnreadCount(response.unreadCount || 0);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  useEffect(() => {
    if (hasMounted && auth_token && authUser) {
      fetchNotifications();
      
      // Initialize socket for real-time notifications
      const socket = io(process.env.NEXT_PUBLIC_API_URL as string, {
        withCredentials: true,
      });

      // Join personal room based on user ID
      socket.emit("join_room", authUser._id);

      socket.on("new_notification", (notification: Notification) => {
        setNotifications(prev => [notification, ...prev].slice(0, 5));
        setUnreadCount(prev => prev + 1);
        
        // Optional: Trigger a browser notification or sound
      });

      return () => {
        socket.disconnect();
      };
    }
  }, [hasMounted, auth_token, authUser]);

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationApi.markAsRead(id);
      fetchNotifications();
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationApi.markAllAsRead();
      fetchNotifications();
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  if (!hasMounted || !auth_token) return null;

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <button className="relative hover:text-accent hoverEffect p-1" aria-label="Notifications">
          <Bell size={24} />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-[10px] bg-red-500 hover:bg-red-600 border-2 border-white rounded-full">
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80 p-0" align="end">
        <DropdownMenuLabel className="p-4 flex items-center justify-between font-bold">
          Notifications
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-xs h-8 text-[#d52245] hover:text-[#b41d3a]" 
              onClick={handleMarkAllAsRead}
            >
              Mark all as read
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <ScrollArea className="h-[400px]">
          {notifications && notifications.length > 0 ? (
            notifications.map((notif) => (
              <DropdownMenuItem
                key={notif._id}
                className={`p-4 flex flex-col items-start gap-1 cursor-pointer focus:bg-accent/50 ${!notif.isRead ? "bg-red-50/50 border-l-4 border-l-[#d52245]" : ""}`}
                onSelect={() => {
                  if (!notif.isRead) handleMarkAsRead(notif._id);
                }}
              >
                <Link href={notif.actionUrl || "#"} className="w-full">
                  <div className="flex justify-between items-start w-full">
                    <span className="font-semibold text-sm line-clamp-1">{notif.title}</span>
                    <span className="text-[10px] text-muted-foreground shrink-0">
                      {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                    {notif.message}
                  </p>
                </Link>
              </DropdownMenuItem>
            ))
          ) : (
            <div className="p-8 text-center text-sm text-muted-foreground">
              No notifications yet
            </div>
          )}
        </ScrollArea>
        <DropdownMenuSeparator />
        <Link href="/user/notifications" className="block p-3 text-center text-xs font-medium text-[#d52245] hover:bg-accent hover:text-white transition-colors">
          View all notifications
        </Link>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationIcon;
