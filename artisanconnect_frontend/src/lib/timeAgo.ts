/** "just now", "5 min ago", "3 h ago", "2 days ago", then a date. */
export function timeAgo(isoTimestamp: string, now: Date = new Date()): string {
  const then = new Date(isoTimestamp);
  const seconds = Math.max(0, Math.round((now.getTime() - then.getTime()) / 1000));

  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return days === 1 ? "yesterday" : `${days} days ago`;
  return then.toLocaleDateString();
}
