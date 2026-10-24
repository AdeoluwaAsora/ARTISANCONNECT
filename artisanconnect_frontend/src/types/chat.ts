export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  content: string;
  /** Not sent by the backend yet; image messages need File uploads first. */
  imageUrl?: string;
  sentAt: string;
  /** When the other person read it; undefined = not yet. */
  readAt?: string;
}

export interface ChatConversation {
  id: string;
  /** The other person. */
  participantId: string;
  participantName: string;
  participantInitials: string;
  participantRole: "Customer" | "Artisan";
  isOnline: boolean;
  jobId?: string;
  jobTitle?: string;
  /** "" until the first message. */
  lastMessage: string;
  /** Last message time, or when the chat was opened if it has none yet. */
  lastMessageAt: string;
  unreadCount: number;
}

/** Matches the backend's ConversationResult. */
export interface ConversationResult {
  conversationId: string;
  participantId: string;
  participantName: string;
  participantRole: "Customer" | "Artisan";
  isOnline: boolean;
  jobId: string | null;
  jobTitle: string | null;
  lastMessage: string | null;
  lastMessageAtUtc: string | null;
  createdAtUtc: string;
  unreadCount: number;
}

/** Matches the backend's ChatMessageResult (also the hub's ReceiveMessage payload). */
export interface ChatMessageResult {
  messageId: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  content: string;
  sentAtUtc: string;
  readAtUtc: string | null;
}
