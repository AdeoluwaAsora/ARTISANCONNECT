import type { ChatConversation, ChatMessage } from "@/types/chat";
import { delay } from "./delay";

/**
 * SWAP POINT FOR REAL-TIME: once the backend exposes a SignalR hub (e.g.
 * /hubs/chat), replace this EventTarget-based emitter with a HubConnection
 * from @microsoft/signalr. Every place in the UI that calls `chatEvents.on(...)`
 * should instead subscribe to `connection.on("ReceiveMessage", ...)` etc.
 * The conversation/message list shapes below (ChatConversation, ChatMessage)
 * are designed to match what a real hub payload would look like, so the
 * consuming components (ConversationList, ChatWindow) shouldn't need to change.
 */
class ChatEventEmitter extends EventTarget {
  emitMessage(message: ChatMessage) {
    this.dispatchEvent(new CustomEvent("message", { detail: message }));
  }
  onMessage(callback: (message: ChatMessage) => void) {
    const handler = (e: Event) => callback((e as CustomEvent<ChatMessage>).detail);
    this.addEventListener("message", handler);
    return () => this.removeEventListener("message", handler);
  }

  emitTyping(conversationId: string, isTyping: boolean) {
    this.dispatchEvent(
      new CustomEvent("typing", { detail: { conversationId, isTyping } }),
    );
  }
  onTyping(callback: (payload: { conversationId: string; isTyping: boolean }) => void) {
    const handler = (e: Event) =>
      callback((e as CustomEvent<{ conversationId: string; isTyping: boolean }>).detail);
    this.addEventListener("typing", handler);
    return () => this.removeEventListener("typing", handler);
  }
}

export const chatEvents = new ChatEventEmitter();

const CURRENT_USER_ID = "self";

let conversations: ChatConversation[] = [
  {
    id: "conv-1",
    participantId: "artisan-2",
    participantName: "Amaka Titus",
    participantInitials: "AT",
    participantRole: "Artisan",
    isOnline: true,
    jobId: "job-1",
    jobTitle: "Fix leaking kitchen tap",
    lastMessage: "Can come by this afternoon, I have the part in stock already.",
    lastMessageAt: "2026-07-01T10:00:00Z",
    unreadCount: 2,
  },
  {
    id: "conv-2",
    participantId: "artisan-1",
    participantName: "Chidi Okafor",
    participantInitials: "CO",
    participantRole: "Artisan",
    isOnline: false,
    jobId: "job-2",
    jobTitle: "Install 3 ceiling fans",
    lastMessage: "Sounds good, see you tomorrow at 10am.",
    lastMessageAt: "2026-06-29T15:30:00Z",
    unreadCount: 0,
  },
  {
    id: "conv-3",
    participantId: "artisan-4",
    participantName: "Ngozi Eze",
    participantInitials: "NE",
    participantRole: "Artisan",
    isOnline: true,
    jobId: "job-3",
    jobTitle: "AC servicing and gas refill",
    lastMessage: "Thanks for the quick job, 5 stars!",
    lastMessageAt: "2026-06-10T13:00:00Z",
    unreadCount: 0,
  },
];

const messagesByConversation: Record<string, ChatMessage[]> = {
  "conv-1": [
    {
      id: "m1",
      conversationId: "conv-1",
      senderId: "artisan-2",
      senderName: "Amaka Titus",
      content: "Hi! I saw your job post about the leaking tap.",
      sentAt: "2026-07-01T09:50:00Z",
      readAt: "2026-07-01T09:51:00Z",
    },
    {
      id: "m2",
      conversationId: "conv-1",
      senderId: CURRENT_USER_ID,
      senderName: "You",
      content: "Hi Amaka, yes it's been dripping for two days now.",
      sentAt: "2026-07-01T09:55:00Z",
      readAt: "2026-07-01T09:56:00Z",
    },
    {
      id: "m3",
      conversationId: "conv-1",
      senderId: "artisan-2",
      senderName: "Amaka Titus",
      content: "Can come by this afternoon, I have the part in stock already.",
      sentAt: "2026-07-01T10:00:00Z",
    },
  ],
  "conv-2": [
    {
      id: "m4",
      conversationId: "conv-2",
      senderId: "artisan-1",
      senderName: "Chidi Okafor",
      content: "Sounds good, see you tomorrow at 10am.",
      sentAt: "2026-06-29T15:30:00Z",
      readAt: "2026-06-29T15:31:00Z",
    },
  ],
  "conv-3": [
    {
      id: "m5",
      conversationId: "conv-3",
      senderId: CURRENT_USER_ID,
      senderName: "You",
      content: "Thanks for the quick job, 5 stars!",
      sentAt: "2026-06-10T13:00:00Z",
      readAt: "2026-06-10T13:05:00Z",
    },
  ],
};

const canned = [
  "Sounds good, thanks for the update!",
  "Okay, I'll be there.",
  "Got it, appreciate the details.",
  "Perfect, see you then.",
];

export const chatApi = {
  getConversations: () => delay([...conversations], 350),

  getMessages: (conversationId: string) =>
    delay([...(messagesByConversation[conversationId] ?? [])], 300),

  sendMessage: async (conversationId: string, content: string, imageUrl?: string) => {
    const message: ChatMessage = {
      id: `m-${Date.now()}`,
      conversationId,
      senderId: CURRENT_USER_ID,
      senderName: "You",
      content,
      imageUrl,
      sentAt: new Date().toISOString(),
    };

    messagesByConversation[conversationId] = [
      ...(messagesByConversation[conversationId] ?? []),
      message,
    ];
    conversations = conversations.map((c) =>
      c.id === conversationId
        ? { ...c, lastMessage: content, lastMessageAt: message.sentAt }
        : c,
    );

    await delay(null, 250);

    // Simulate the other participant typing, then replying — this whole
    // block goes away once a real hub is pushing real replies.
    const conversation = conversations.find((c) => c.id === conversationId);
    if (conversation) {
      setTimeout(() => chatEvents.emitTyping(conversationId, true), 500);
      setTimeout(() => {
        chatEvents.emitTyping(conversationId, false);
        const reply: ChatMessage = {
          id: `m-${Date.now()}-reply`,
          conversationId,
          senderId: conversation.participantId,
          senderName: conversation.participantName,
          content: canned[Math.floor(Math.random() * canned.length)],
          sentAt: new Date().toISOString(),
        };
        messagesByConversation[conversationId] = [
          ...(messagesByConversation[conversationId] ?? []),
          reply,
        ];
        conversations = conversations.map((c) =>
          c.id === conversationId
            ? { ...c, lastMessage: reply.content, lastMessageAt: reply.sentAt }
            : c,
        );
        chatEvents.emitMessage(reply);
      }, 1800);
    }

    return message;
  },

  markAsRead: (conversationId: string) => {
    conversations = conversations.map((c) =>
      c.id === conversationId ? { ...c, unreadCount: 0 } : c,
    );
    return delay(null, 150);
  },
};

export { CURRENT_USER_ID };
