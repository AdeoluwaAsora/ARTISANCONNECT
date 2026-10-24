import { apiClient } from "./client";
import { asUtc, rethrowApiError, unwrap } from "./unwrap";
import { initialsOf } from "@/lib/initials";
import type { ApiResponse, PaginatedList } from "@/types/api";
import type { ChatConversation, ChatMessage, ChatMessageResult, ConversationResult } from "@/types/chat";

/**
 * Chat over REST (replaced the old mock service). Live updates — new messages,
 * read receipts, typing, presence — arrive on the SignalR hub; see
 * features/chat/chatHub.ts.
 */

// The backend caps page size at 50.
const PAGE_SIZE = 50;

export function toConversation(result: ConversationResult): ChatConversation {
  return {
    id: result.conversationId,
    participantId: result.participantId,
    participantName: result.participantName,
    participantInitials: initialsOf(result.participantName),
    participantRole: result.participantRole,
    isOnline: result.isOnline,
    jobId: result.jobId ?? undefined,
    jobTitle: result.jobTitle ?? undefined,
    lastMessage: result.lastMessage ?? "",
    lastMessageAt: asUtc(result.lastMessageAtUtc ?? result.createdAtUtc),
    unreadCount: result.unreadCount,
  };
}

export function toChatMessage(result: ChatMessageResult): ChatMessage {
  return {
    id: result.messageId,
    conversationId: result.conversationId,
    senderId: result.senderId,
    senderName: result.senderName,
    content: result.content,
    sentAt: asUtc(result.sentAtUtc),
    readAt: result.readAtUtc ? asUtc(result.readAtUtc) : undefined,
  };
}

export const chatApi = {
  /** The signed-in user's conversations, most recent activity first. */
  getConversations: async (): Promise<ChatConversation[]> => {
    try {
      const res = await apiClient.get<ApiResponse<PaginatedList<ConversationResult>>>("/conversations", {
        params: { pageNumber: 1, pageSize: PAGE_SIZE },
      });
      return unwrap(res.data).items.map(toConversation);
    } catch (err) {
      return rethrowApiError(err);
    }
  },

  /** Opens (or creates) the chat with another user, optionally tagged with a job. */
  startConversation: async (participantId: string, jobId?: string): Promise<ChatConversation> => {
    try {
      const res = await apiClient.post<ApiResponse<ConversationResult>>("/conversations", {
        participantId,
        jobId: jobId ?? null,
      });
      return toConversation(unwrap(res.data));
    } catch (err) {
      return rethrowApiError(err);
    }
  },

  /** The latest 50 messages, oldest first (ready to display top to bottom). */
  getMessages: async (conversationId: string): Promise<ChatMessage[]> => {
    try {
      const res = await apiClient.get<ApiResponse<PaginatedList<ChatMessageResult>>>(
        `/conversations/${conversationId}/messages`,
        { params: { pageNumber: 1, pageSize: PAGE_SIZE } },
      );
      return unwrap(res.data).items.map(toChatMessage).reverse();
    } catch (err) {
      return rethrowApiError(err);
    }
  },

  sendMessage: async (conversationId: string, content: string): Promise<ChatMessage> => {
    try {
      const res = await apiClient.post<ApiResponse<ChatMessageResult>>(
        `/conversations/${conversationId}/messages`,
        { content },
      );
      return toChatMessage(unwrap(res.data));
    } catch (err) {
      return rethrowApiError(err);
    }
  },

  markAsRead: async (conversationId: string): Promise<void> => {
    try {
      await apiClient.post<ApiResponse<null>>(`/conversations/${conversationId}/read`);
    } catch (err) {
      rethrowApiError(err);
    }
  },
};
