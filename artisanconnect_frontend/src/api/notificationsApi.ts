import { apiClient } from "./client";
import { asUtc, rethrowApiError, unwrap } from "./unwrap";
import type { ApiResponse, PaginatedList } from "@/types/api";
import type { AppNotification, NotificationResult } from "@/types/notification";

/** How many recent notifications the bell's dropdown shows. */
const RECENT_COUNT = 20;

function toNotification(result: NotificationResult): AppNotification {
  return {
    id: result.notificationId,
    type: result.type,
    title: result.title,
    message: result.message,
    jobId: result.jobId,
    isRead: result.isRead,
    createdAt: asUtc(result.createdAtUtc),
  };
}

export const notificationsApi = {
  /** The signed-in user's most recent notifications, newest first. */
  getRecent: async (): Promise<AppNotification[]> => {
    try {
      const res = await apiClient.get<ApiResponse<PaginatedList<NotificationResult>>>("/notifications", {
        params: { pageNumber: 1, pageSize: RECENT_COUNT },
      });
      return unwrap(res.data).items.map(toNotification);
    } catch (err) {
      return rethrowApiError(err);
    }
  },

  getUnreadCount: async (): Promise<number> => {
    try {
      const res = await apiClient.get<ApiResponse<number>>("/notifications/unread-count");
      return unwrap(res.data);
    } catch (err) {
      return rethrowApiError(err);
    }
  },

  markRead: async (id: string): Promise<AppNotification> => {
    try {
      const res = await apiClient.post<ApiResponse<NotificationResult>>(`/notifications/${id}/read`);
      return toNotification(unwrap(res.data));
    } catch (err) {
      return rethrowApiError(err);
    }
  },

  /** Returns how many were marked. */
  markAllRead: async (): Promise<number> => {
    try {
      const res = await apiClient.post<ApiResponse<number>>("/notifications/read-all");
      return unwrap(res.data);
    } catch (err) {
      return rethrowApiError(err);
    }
  },
};
