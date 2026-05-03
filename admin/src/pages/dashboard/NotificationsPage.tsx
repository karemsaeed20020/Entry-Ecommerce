import { useState, useEffect } from "react";
import { 
  Bell, 
  CheckCircle2, 
  Trash2, 
  Clock, 
  ChevronRight,
  Filter,
  MoreVertical,
  Check
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { api } from "../../lib/api";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "../../components/ui/dropdown-menu";
import { Badge } from "../../components/ui/badge";

interface Notification {
  _id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const endpoint = filter === "unread" ? "/notifications?unreadOnly=true" : "/notifications";
      const response = await api.get(endpoint);
      if (response.data.success) {
        setNotifications(response.data.notifications);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [filter]);

  const handleMarkAsRead = async (id: string) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(prev => 
        prev.map(n => n._id === id ? { ...n, isRead: true } : n)
      );
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await api.put("/notifications/read-all");
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications(prev => prev.filter(n => n._id !== id));
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "new_order": return <Bell className="text-blue-500" size={20} />;
      case "review_posted": return <CheckCircle2 className="text-green-500" size={20} />;
      default: return <Bell className="text-gray-500" size={20} />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
          <p className="text-muted-foreground">Manage your administrative alerts and notifications.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleMarkAllAsRead}
            disabled={!notifications.some(n => !n.isRead)}
          >
            <Check className="mr-2 h-4 w-4" />
            Mark all as read
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="border-b pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant={filter === "all" ? "default" : "ghost"} 
                size="sm" 
                onClick={() => setFilter("all")}
                className="rounded-full px-4"
              >
                All
              </Button>
              <Button 
                variant={filter === "unread" ? "default" : "ghost"} 
                size="sm" 
                onClick={() => setFilter("unread")}
                className="rounded-full px-4"
              >
                Unread
                {notifications.filter(n => !n.isRead).length > 0 && (
                  <Badge variant="secondary" className="ml-2 bg-blue-100 text-blue-700 hover:bg-blue-200">
                    {notifications.filter(n => !n.isRead).length}
                  </Badge>
                )}
              </Button>
            </div>
            <Button variant="ghost" size="icon">
              <Filter size={18} />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-12 text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#d52245] border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status">
                <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">Loading...</span>
              </div>
            </div>
          ) : notifications.length > 0 ? (
            <div className="divide-y">
              {notifications.map((notif) => (
                <div 
                  key={notif._id} 
                  className={`flex items-start gap-4 p-4 hover:bg-slate-50 transition-colors group ${!notif.isRead ? "bg-blue-50/30" : ""}`}
                >
                  <div className={`p-2 rounded-full ${!notif.isRead ? "bg-white shadow-sm ring-1 ring-blue-100" : "bg-slate-100 text-slate-400"}`}>
                    {getIcon(notif.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h3 className={`text-sm font-semibold truncate ${!notif.isRead ? "text-slate-900" : "text-slate-600"}`}>
                        {notif.title}
                      </h3>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-400 flex items-center gap-1 shrink-0">
                          <Clock size={12} />
                          {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                        </span>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                              <MoreVertical size={14} />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {!notif.isRead && (
                              <DropdownMenuItem onClick={() => handleMarkAsRead(notif._id)}>
                                <CheckCircle2 className="mr-2 h-4 w-4" />
                                Mark as read
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem className="text-red-600 focus:text-red-600" onClick={() => handleDelete(notif._id)}>
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                    <p className={`text-sm line-clamp-2 ${!notif.isRead ? "text-slate-700" : "text-slate-500"}`}>
                      {notif.message}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400 mb-4">
                <Bell size={24} />
              </div>
              <h3 className="text-lg font-medium text-slate-900">No notifications</h3>
              <p className="text-slate-500">You're all caught up! When you get new notifications, they'll appear here.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
