export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  content: string;
  imageUrl?: string;
  sentAt: string;
  readAt?: string;
}

export interface ChatConversation {
  id: string;
  participantId: string;
  participantName: string;
  participantInitials: string;
  participantRole: "Customer" | "Artisan";
  isOnline: boolean;
  jobId?: string;
  jobTitle?: string;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
}
