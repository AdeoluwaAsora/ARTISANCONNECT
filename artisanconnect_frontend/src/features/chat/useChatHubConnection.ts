import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/store/AuthContext";
import type { ChatConversation } from "@/types/chat";
import { chatHub, startChatHub, stopChatHub } from "./chatHub";

const CONVERSATIONS_KEY = ["chat", "conversations"] as const;
const RETRY_MS = 15_000;

/**
 * Keeps the chat hub connected while a user is signed in, and keeps the
 * conversation list (unread counts, previews, online dots) fresh from hub
 * events. Mounted once, in the authenticated DashboardLayout.
 */
export function useChatHubConnection() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const userId = user?.userId ?? null;

  useEffect(() => {
    if (!userId) return;

    let cancelled = false;
    let retryTimer: ReturnType<typeof setTimeout> | undefined;

    // The initial start isn't covered by withAutomaticReconnect, so retry it
    // here (e.g. the API was still starting up).
    const connect = () => {
      startChatHub().catch(() => {
        if (!cancelled) retryTimer = setTimeout(connect, RETRY_MS);
      });
    };
    connect();

    const unsubscribers = [
      chatHub.onMessage(() => {
        queryClient.invalidateQueries({ queryKey: CONVERSATIONS_KEY });
      }),
      chatHub.onPresenceChanged((participantId, isOnline) => {
        queryClient.setQueryData<ChatConversation[]>(CONVERSATIONS_KEY, (list) =>
          list?.map((c) => (c.participantId === participantId ? { ...c, isOnline } : c)),
        );
      }),
      chatHub.onReconnected(() => {
        queryClient.invalidateQueries({ queryKey: ["chat"] });
      }),
    ];

    return () => {
      cancelled = true;
      clearTimeout(retryTimer);
      unsubscribers.forEach((unsubscribe) => unsubscribe());
      void stopChatHub();
    };
  }, [userId, queryClient]);
}
