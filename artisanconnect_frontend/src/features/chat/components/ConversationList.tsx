import { PulseDot } from "@/components/ui";
import type { ChatConversation } from "@/types/chat";
import styles from "./ConversationList.module.css";

function timeAgo(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  if (hours < 1) return "Now";
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
}

export interface ConversationListProps {
  conversations: ChatConversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
}

export function ConversationList({ conversations, activeId, onSelect }: ConversationListProps) {
  return (
    <div className={styles.list}>
      {conversations.map((conv) => (
        <button
          key={conv.id}
          type="button"
          className={`${styles.item} ${conv.id === activeId ? styles.itemActive : ""}`}
          onClick={() => onSelect(conv.id)}
        >
          <div className={styles.avatarWrap}>
            <span className={styles.avatar} aria-hidden="true">
              {conv.participantInitials}
            </span>
            {conv.isOnline && (
              <span className={styles.onlineDot}>
                <PulseDot tone="accent" size="sm" animated={false} />
              </span>
            )}
          </div>

          <div className={styles.body}>
            <div className={styles.topRow}>
              <span className={styles.name}>{conv.participantName}</span>
              <span className={styles.time}>{timeAgo(conv.lastMessageAt)}</span>
            </div>
            {conv.jobTitle && <span className={styles.jobTag}>{conv.jobTitle}</span>}
            <span className={styles.preview}>{conv.lastMessage || "No messages yet"}</span>
          </div>

          {conv.unreadCount > 0 && (
            <span className={styles.unreadBadge}>{conv.unreadCount}</span>
          )}
        </button>
      ))}

      {conversations.length === 0 && (
        <p className={`body-sm ${styles.empty}`}>
          No conversations yet. Start one from an artisan's profile, a bid, or a job page.
        </p>
      )}
    </div>
  );
}
