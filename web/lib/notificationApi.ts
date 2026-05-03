import authApi from "./authApi";

export interface Notification {
  _id: string;
  userId: string;
  senderId?: {
    _id: string;
    name: string;
    image?: string;
  };
  type: "order_status" | "new_order" | "review_posted" | "promotion" | "system";
  title: string;
  message: string;
  actionUrl?: string;
  isRead: boolean;
  createdAt: string;
}

export interface NotificationsResponse {
  success: boolean;
  notifications: Notification[];
  total: number;
  unreadCount: number;
  totalPages: number;
  page: number;
}

const notificationApi = {
  getNotifications: async (page = 1, limit = 20, unreadOnly = false) => {
    const response = await authApi.get<NotificationsResponse>(
      `/notifications?page=${page}&limit=${limit}&unreadOnly=${unreadOnly}`
    );
    return response.success ? response.data : { notifications: [], total: 0, unreadCount: 0, success: false };
  },

  getUnreadCount: async () => {
    const response = await authApi.get<{ success: boolean; count: number }>(
      "/notifications/unread-count"
    );
    return response.success ? response.data : { count: 0, success: false };
  },

  markAsRead: async (id: string) => {
    const response = await authApi.put<{ success: boolean; notification: Notification }>(
      `/notifications/${id}/read`
    );
    return response.success ? response.data : { success: false };
  },

  markAllAsRead: async () => {
    const response = await authApi.put<{ success: boolean; message: string }>(
      "/notifications/read-all"
    );
    return response.success ? response.data : { success: false };
  },

  deleteNotification: async (id: string) => {
    const response = await authApi.delete<{ success: boolean; message: string }>(
      `/notifications/${id}`
    );
    return response.success ? response.data : { success: false };
  },
};

export default notificationApi;
