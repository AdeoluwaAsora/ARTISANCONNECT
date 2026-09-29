import { FiBell, FiMenu } from "react-icons/fi";
import { PulseDot } from "@/components/ui";
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
        <button type="button" className={styles.iconButton} aria-label="Notifications">
          <FiBell size={20} />
          <span className={styles.badge} aria-hidden="true">
            3
          </span>
        </button>
      </div>
    </header>
  );
}
