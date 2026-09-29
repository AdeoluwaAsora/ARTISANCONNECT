import { useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { FiSend, FiImage, FiCheckCircle } from "react-icons/fi";
import { PulseDot } from "@/components/ui";
import { chatApi, chatEvents, CURRENT_USER_ID } from "@/services/mockChat";
import type { ChatConversation, ChatMessage } from "@/types/chat";
import { MessageBubble } from "./MessageBubble";
import { TypingIndicator } from "./TypingIndicator";
import styles from "./ChatWindow.module.css";

export interface ChatWindowProps {
  conversation: ChatConversation;
}

export function ChatWindow({ conversation }: ChatWindowProps) {
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [localMessages, setLocalMessages] = useState<ChatMessage[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: initialMessages } = useQuery({
    queryKey: ["chat", "messages", conversation.id],
    queryFn: () => chatApi.getMessages(conversation.id),
  });

  useEffect(() => {
    if (initialMessages) setLocalMessages(initialMessages);
  }, [initialMessages]);

  useEffect(() => {
    chatApi.markAsRead(conversation.id).then(() => {
      queryClient.invalidateQueries({ queryKey: ["chat", "conversations"] });
    });
  }, [conversation.id, queryClient]);

  useEffect(() => {
    const unsubscribeMessage = chatEvents.onMessage((message) => {
      if (message.conversationId === conversation.id) {
        setLocalMessages((prev) => [...prev, message]);
      }
    });
    const unsubscribeTyping = chatEvents.onTyping(({ conversationId, isTyping: typing }) => {
      if (conversationId === conversation.id) setIsTyping(typing);
    });
    return () => {
      unsubscribeMessage();
      unsubscribeTyping();
    };
  }, [conversation.id]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [localMessages, isTyping]);

  const handleSend = async (imageUrl?: string) => {
    const content = draft.trim();
    if (!content && !imageUrl) return;
    setDraft("");
    const message = await chatApi.sendMessage(conversation.id, content, imageUrl);
    setLocalMessages((prev) => [...prev, message]);
    queryClient.invalidateQueries({ queryKey: ["chat", "conversations"] });
  };

  const handleImagePick = (files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;
    handleSend(URL.createObjectURL(file));
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
        {conversation.jobTitle && (
          <span className={styles.jobTag}>
            <FiCheckCircle size={12} aria-hidden="true" />
            {conversation.jobTitle}
          </span>
        )}
      </div>

      <div className={styles.messages} ref={scrollRef}>
        {localMessages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            isOwn={message.senderId === CURRENT_USER_ID}
          />
        ))}
        {isTyping && <TypingIndicator name={conversation.participantName} />}
      </div>

      <form
        className={styles.inputRow}
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
      >
        <button
          type="button"
          className={styles.attachButton}
          onClick={() => fileInputRef.current?.click()}
          aria-label="Attach image"
        >
          <FiImage size={20} />
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="visually-hidden"
          onChange={(e) => handleImagePick(e.target.files)}
        />
        <input
          type="text"
          className={styles.textInput}
          placeholder="Type a message…"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
        />
        <button type="submit" className={styles.sendButton} aria-label="Send message">
          <FiSend size={18} />
        </button>
      </form>
    </div>
  );
}
