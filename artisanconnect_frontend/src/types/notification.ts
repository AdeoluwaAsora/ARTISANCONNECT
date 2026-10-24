export type NotificationType = "NewBid" | "BidAccepted" | "BidRejected" | "JobCancelled";

export interface AppNotification {
  id: string;
  type: NotificationType | string;
  title: string;
  message: string;
  /** The job it's about; links to /jobs/:id. */
  jobId: string | null;
  isRead: boolean;
  createdAt: string;
}

/** Matches the backend's NotificationResult. */
export interface NotificationResult {
  notificationId: string;
  type: string;
  title: string;
  message: string;
  jobId: string | null;
  isRead: boolean;
  createdAtUtc: string;
}
