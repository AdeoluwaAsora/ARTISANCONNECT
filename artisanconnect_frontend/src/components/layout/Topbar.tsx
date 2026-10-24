import { FiMenu } from "react-icons/fi";
import { PulseDot } from "@/components/ui";
import { NotificationBell } from "@/features/notifications/components/NotificationBell";
import styles from "./Topbar.module.css";

interface TopbarProps {
  title: string;
  onMenuClick: () => void;
}

export function Topbar({ title, onMenuClick }: TopbarProps) {
  return (
    <header className={styles.topbar}>
      <button
        type="button"
        className={styles.menuButton}
        onClick={onMenuClick}
        aria-label="Open menu"
      >
        <FiMenu size={22} />
      </button>

      <h1 className={`heading-md ${styles.title}`}>{title}</h1>

      <div className={styles.actions}>
        <div className={styles.onlineBadge}>
          <PulseDot tone="accent" size="sm" />
          <span className="body-sm">Online</span>
        </div>
        <NotificationBell />
      </div>
    </header>
  );
}
