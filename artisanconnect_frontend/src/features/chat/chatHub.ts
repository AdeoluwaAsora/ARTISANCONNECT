import {
  HubConnectionBuilder,
  HubConnectionState,
  LogLevel,
  type HubConnection,
} from "@microsoft/signalr";
import { getAccessToken } from "@/store/authSession";
import { asUtc } from "@/api/unwrap";
import { toChatMessage } from "@/api/chatApi";
import type { ChatMessage, ChatMessageResult } from "@/types/chat";

/**
 * One SignalR connection to /hubs/chat for the whole app. Started when a user
 * is signed in (see useChatHubConnection) and stopped on sign-out. Event names
 * match ChatHub on the backend.
 */

function hubUrl(): string {
  const base = import.meta.env.VITE_API_BASE_URL as string | undefined;
  // An absolute API URL (e.g. https://api.example.com/api/v1) means the hub is
  // on that host too; otherwise it's same-origin, proxied by nginx or Vite.
  if (base && /^https?:\/\//i.test(base)) return new URL("/hubs/chat", base).toString();
  return "/hubs/chat";
}

let connection: HubConnection | null = null;
let starting: Promise<void> | null = null;

function getConnection(): HubConnection {
  if (!connection) {
    connection = new HubConnectionBuilder()
      .withUrl(hubUrl(), {
        // Read on every (re)connect, so a refreshed token is picked up.
        accessTokenFactory: () => getAccessToken() ?? "",
      })
      .withAutomaticReconnect()
      .configureLogging(LogLevel.Warning)
      .build();
  }
  return connection;
}

export async function startChatHub(): Promise<void> {
  const conn = getConnection();
  if (conn.state !== HubConnectionState.Disconnected) return starting ?? Promise.resolve();
  starting = conn.start().finally(() => {
    starting = null;
  });
  return starting;
}

export async function stopChatHub(): Promise<void> {
  if (connection && connection.state !== HubConnectionState.Disconnected) {
    await connection.stop();
  }
}

type Unsubscribe = () => void;

function on<T extends unknown[]>(event: string, handler: (...args: T) => void): Unsubscribe {
  const conn = getConnection();
  const wrapped = (...args: unknown[]) => handler(...(args as T));
  conn.on(event, wrapped);
  return () => conn.off(event, wrapped);
}

export const chatHub = {
  onMessage: (handler: (message: ChatMessage) => void): Unsubscribe =>
    on<[ChatMessageResult]>("ReceiveMessage", (result) => handler(toChatMessage(result))),

  /** The other participant read the conversation up to readAt. */
  onConversationRead: (handler: (conversationId: string, readAt: string) => void): Unsubscribe =>
    on<[string, string]>("ConversationRead", (conversationId, readAtUtc) =>
      handler(conversationId, asUtc(readAtUtc)),
    ),

  onTyping: (handler: (conversationId: string, isTyping: boolean) => void): Unsubscribe =>
    on<[string, boolean]>("UserTyping", handler),

  onPresenceChanged: (handler: (userId: string, isOnline: boolean) => void): Unsubscribe =>
    on<[string, boolean]>("PresenceChanged", handler),

  /** After a dropped connection comes back; anything sent meanwhile was missed. */
  onReconnected: (handler: () => void): Unsubscribe => {
    const conn = getConnection();
    let active = true;
    conn.onreconnected(() => {
      if (active) handler();
    });
    return () => {
      active = false;
    };
  },

  /** Best-effort: typing indicators aren't worth an error. */
  sendTyping: (conversationId: string, isTyping: boolean): void => {
    const conn = getConnection();
    if (conn.state === HubConnectionState.Connected) {
      conn.invoke("Typing", conversationId, isTyping).catch(() => undefined);
    }
  },
};
