import { api } from "./axios";
import type { NotificationResponse } from "../types";

export const notificationsApi = {
  getMyNotifications: () =>
    api.get<NotificationResponse[]>("/api/notifications/my"),

  getUnreadCount: () =>
    api.get<number>("/api/notifications/unread-count"),

  markAsRead: (id: number) =>
    api.put<NotificationResponse>(`/api/notifications/${id}/read`),

  markAllAsRead: () =>
    api.put<void>("/api/notifications/read-all"),
};

