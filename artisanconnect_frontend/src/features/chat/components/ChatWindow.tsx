import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { FiSend, FiBriefcase } from "react-icons/fi";
import { PulseDot } from "@/components/ui";
import { chatApi } from "@/api/chatApi";
import { useAuth } from "@/store/AuthContext";
import type { ChatConversation, ChatMessage } from "@/types/chat";
import { chatHub } from "../chatHub";
import { MessageBubble } from "./MessageBubble";
import { TypingIndicator } from "./TypingIndicator";
import styles from "./ChatWindow.module.css";

const MAX_LENGTH = 2000;
/** Stop showing "typing…" if we stop hearing from the other side. */
const TYPING_TIMEOUT_MS = 5000;
/** Tell the other side we stopped typing after this much quiet. */
const TYPING_IDLE_MS = 3000;

export interface ChatWindowProps {
  conversation: ChatConversation;
}

export function ChatWindow({ conversation }: ChatWindowProps) {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const myId = user?.userId ?? "";

  const [draft, setDraft] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [isOtherTyping, setIsOtherTyping] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const typingSentRef = useRef(false);
  const typingIdleTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const otherTypingTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const { data: loadedMessages, isLoading, error: loadError } = useQuery({
    queryKey: ["chat", "messages", conversation.id],
    queryFn: () => chatApi.getMessages(conversation.id),
  });

  useEffect(() => {
    if (loadedMessages) setMessages(loadedMessages);
  }, [loadedMessages]);

  // Add a message unless we already have it (the sender gets it twice: from
  // the REST response and from the hub).
  const addMessage = useCallback((message: ChatMessage) => {
    setMessages((prev) => (prev.some((m) => m.id === message.id) ? prev : [...prev, message]));
  }, []);

  const markRead = useCallback(() => {
    chatApi
      .markAsRead(conversation.id)
      .then(() => queryClient.invalidateQueries({ queryKey: ["chat", "conversations"] }))
      .catch(() => undefined);
  }, [conversation.id, queryClient]);

  // Opening a conversation reads it.
  useEffect(() => {
    markRead();
  }, [markRead]);

  // Live events for this conversation.
  useEffect(() => {
    const unsubscribers = [
      chatHub.onMessage((message) => {
        if (message.conversationId !== conversation.id) return;
        addMessage(message);
        if (message.senderId !== myId) {
          setIsOtherTyping(false);
          if (document.visibilityState === "visible") markRead();
        }
      }),
      chatHub.onConversationRead((conversationId, readAt) => {
        if (conversationId !== conversation.id) return;
        const readTime = new Date(readAt).getTime();
        setMessages((prev) =>
          prev.map((m) =>
            m.senderId === myId && !m.readAt && new Date(m.sentAt).getTime() <= readTime
              ? { ...m, readAt }
              : m,
          ),
        );
      }),
      chatHub.onTyping((conversationId, typing) => {
        if (conversationId !== conversation.id) return;
        setIsOtherTyping(typing);
        clearTimeout(otherTypingTimer.current);
        if (typing) otherTypingTimer.current = setTimeout(() => setIsOtherTyping(false), TYPING_TIMEOUT_MS);
      }),
    ];
    return () => unsubscribers.forEach((unsubscribe) => unsubscribe());
  }, [conversation.id, myId, addMessage, markRead]);

  const stopTyping = useCallback(() => {
    clearTimeout(typingIdleTimer.current);
    if (typingSentRef.current) {
      typingSentRef.current = false;
      chatHub.sendTyping(conversation.id, false);
    }
  }, [conversation.id]);

  // Leaving the conversation (or switching to another) ends "typing".
  useEffect(() => {
    return () => {
      stopTyping();
      clearTimeout(otherTypingTimer.current);
      setIsOtherTyping(false);
    };
  }, [stopTyping]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isOtherTyping]);

  const handleDraftChange = (value: string) => {
    setDraft(value);
    if (!value.trim()) {
      stopTyping();
      return;
    }
    if (!typingSentRef.current) {
      typingSentRef.current = true;
      chatHub.sendTyping(conversation.id, true);
    }
    clearTimeout(typingIdleTimer.current);
    typingIdleTimer.current = setTimeout(stopTyping, TYPING_IDLE_MS);
  };

  const handleSend = async () => {
    const content = draft.trim();
    if (!content || isSending) return;

    setIsSending(true);
    setSendError(null);
    stopTyping();
    setDraft("");
    try {
      const message = await chatApi.sendMessage(conversation.id, content);
      addMessage(message);
      queryClient.invalidateQueries({ queryKey: ["chat", "conversations"] });
    } catch (err) {
      setDraft(content);
      setSendError(err instanceof Error ? err.message : "Couldn't send your message. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className={styles.window}>
      <div className={styles.header}>
        <span className={styles.avatar} aria-hidden="true">
          {conversation.participantInitials}
        </span>
        <div className={styles.headerInfo}>
          <span className={styles.name}>{conversation.participantName}</span>
          {conversation.isOnline ? (
            <PulseDot tone="accent" label="Online" size="sm" />
          ) : (
            <span className="body-sm">Offline</span>
          )}
        </div>
        {conversation.jobTitle && conversation.jobId && (
          <Link to={`/jobs/${conversation.jobId}`} className={styles.jobTag}>
            <FiBriefcase size={12} aria-hidden="true" />
            {conversation.jobTitle}
          </Link>
        )}
      </div>

      <div className={styles.messages} ref={scrollRef}>
        {isLoading && <p className="body-sm">Loading messages…</p>}
        {loadError && (
          <p className="body-sm" role="alert">
            {loadError instanceof Error ? loadError.message : "Couldn't load messages."}
          </p>
        )}
        {!isLoading && !loadError && messages.length === 0 && (
          <p className="body-sm">No messages yet. Say hello to {conversation.participantName.split(" ")[0]}.</p>
        )}
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} isOwn={message.senderId === myId} />
        ))}
        {isOtherTyping && <TypingIndicator name={conversation.participantName} />}
      </div>

      {sendError && (
        <p className={styles.sendError} role="alert">
          {sendError}
        </p>
      )}

      {/* Image attachments return once File uploads exist; until then a picked
          image would only ever be visible on the sender's screen. */}
      <form
        className={styles.inputRow}
        onSubmit={(e) => {
          e.preventDefault();
          void handleSend();
        }}
      >
        <input
          type="text"
          className={styles.textInput}
          placeholder="Type a message…"
          value={draft}
          maxLength={MAX_LENGTH}
          onChange={(e) => handleDraftChange(e.target.value)}
          aria-label={`Message ${conversation.participantName}`}
        />
        <button
          type="submit"
          className={styles.sendButton}
          aria-label="Send message"
          disabled={isSending || !draft.trim()}
        >
          <FiSend size={18} />
        </button>
      </form>
    </div>
  );
}
