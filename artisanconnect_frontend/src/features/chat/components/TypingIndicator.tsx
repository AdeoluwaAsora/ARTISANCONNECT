import styles from "./TypingIndicator.module.css";

export function TypingIndicator({ name }: { name: string }) {
  return (
    <div className={styles.row}>
      <div className={styles.bubble}>
        <span className={styles.dot} />
        <span className={styles.dot} />
        <span className={styles.dot} />
      </div>
      <span className={styles.label}>{name} is typing…</span>
    </div>
  );
}
