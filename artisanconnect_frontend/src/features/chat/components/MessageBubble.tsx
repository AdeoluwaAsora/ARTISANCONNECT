import { FiCheck, FiCheckCircle } from "react-icons/fi";
import type { ChatMessage } from "@/types/chat";
import styles from "./MessageBubble.module.css";

export interface MessageBubbleProps {
  message: ChatMessage;
  isOwn: boolean;
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export function MessageBubble({ message, isOwn }: MessageBubbleProps) {
  return (
    <div className={`${styles.row} ${isOwn ? styles.rowOwn : ""}`}>
      <div className={`${styles.bubble} ${isOwn ? styles.bubbleOwn : styles.bubbleOther}`}>
        {message.imageUrl && (
          <img src={message.imageUrl} alt="" className={styles.image} />
        )}
        {message.content && <p className={styles.text}>{message.content}</p>}
        <div className={styles.meta}>
          <span className={styles.time}>{formatTime(message.sentAt)}</span>
          {isOwn && (
            <span className={styles.receipt} aria-label={message.readAt ? "Read" : "Sent"}>
              {message.readAt ? <FiCheckCircle size={13} /> : <FiCheck size={13} />}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
