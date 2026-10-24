import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { FiBell, FiCheck } from "react-icons/fi";
import { notificationsApi } from "@/api/notificationsApi";
import { timeAgo } from "@/lib/timeAgo";
import type { AppNotification } from "@/types/notification";
import styles from "./NotificationBell.module.css";

// Polled until Chat adds a real-time (SignalR) channel.
const POLL_INTERVAL_MS = 30_000;

export function NotificationBell() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const { data: unreadCount = 0 } = useQuery({
    queryKey: ["notifications", "unread-count"],
    queryFn: () => notificationsApi.getUnreadCount(),
    refetchInterval: POLL_INTERVAL_MS,
  });

  const { data: notifications, isLoading } = useQuery({
    queryKey: ["notifications", "recent"],
    queryFn: () => notificationsApi.getRecent(),
    enabled: isOpen,
  });

  // A new notification usually means a bid or job changed too.
  const previousCount = useRef(unreadCount);
  useEffect(() => {
    if (unreadCount > previousCount.current) {
      queryClient.invalidateQueries({ queryKey: ["notifications", "recent"] });
      queryClient.invalidateQueries({ queryKey: ["bids"] });
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
    }
    previousCount.current = unreadCount;
  }, [unreadCount, queryClient]);

  // Close on outside click or Escape.
  useEffect(() => {
    if (!isOpen) return;
    const onPointerDown = (e: PointerEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) setIsOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen]);

  const refresh = () => queryClient.invalidateQueries({ queryKey: ["notifications"] });

  const openNotification = async (notification: AppNotification) => {
    setIsOpen(false);
    if (!notification.isRead) {
      try {
        await notificationsApi.markRead(notification.id);
        await refresh();
      } catch {
        // Not worth blocking navigation over; it stays unread and can be retried.
      }
    }
    if (notification.jobId) navigate(`/jobs/${notification.jobId}`);
  };

  const markAllRead = async () => {
    setError(null);
    try {
      await notificationsApi.markAllRead();
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't mark notifications as read.");
    }
  };

  const badgeText = unreadCount > 9 ? "9+" : String(unreadCount);

  return (
    <div className={styles.wrapper} ref={wrapperRef}>
      <button
        type="button"
        className={styles.bellButton}
        onClick={() => setIsOpen((open) => !open)}
        aria-label={unreadCount > 0 ? `Notifications, ${unreadCount} unread` : "Notifications"}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <FiBell size={20} />
        {unreadCount > 0 && (
          <span className={styles.badge} aria-hidden="true">
            {badgeText}
          </span>
        )}
      </button>

      {isOpen && (
        <div className={styles.panel} role="region" aria-label="Notifications">
          <div className={styles.panelHeader}>
            <span className="heading-sm">Notifications</span>
            {unreadCount > 0 && (
              <button type="button" className={styles.markAll} onClick={markAllRead}>
                <FiCheck aria-hidden="true" /> Mark all as read
              </button>
            )}
          </div>

          {error && (
            <p className={styles.error} role="alert">
              {error}
            </p>
          )}

          {isLoading ? (
            <p className={styles.empty}>Loading…</p>
          ) : !notifications || notifications.length === 0 ? (
            <p className={styles.empty}>No notifications yet. We'll let you know when something happens.</p>
          ) : (
            <ul className={styles.list}>
              {notifications.map((n) => (
                <li key={n.id}>
                  <button
                    type="button"
                    className={`${styles.item} ${n.isRead ? "" : styles.unread}`}
                    onClick={() => void openNotification(n)}
                  >
                    {!n.isRead && <span className={styles.dot} aria-label="Unread" />}
                    <span className={styles.itemBody}>
                      <span className={styles.itemTitle}>{n.title}</span>
                      <span className={styles.itemMessage}>{n.message}</span>
                      <span className={styles.itemTime}>{timeAgo(n.createdAt)}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
