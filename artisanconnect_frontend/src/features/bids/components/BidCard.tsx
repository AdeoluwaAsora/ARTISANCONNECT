import { FiMessageCircle } from "react-icons/fi";
import { Badge, Button } from "@/components/ui";
import type { Bid, BidStatus } from "@/types/bid";
import { bidStatusTone } from "@/features/bids/status";
import styles from "./BidCard.module.css";

const statusLabel: Record<BidStatus, string> = {
  pending: "Pending",
  accepted: "Accepted",
  rejected: "Rejected",
  withdrawn: "Withdrawn",
};

export interface BidCardProps {
  bid: Bid;
  onAccept?: (bidId: string) => void;
  onReject?: (bidId: string) => void;
  /** Shown to the artisan who owns a pending bid. */
  onWithdraw?: (bidId: string) => void;
  /** Shown to the customer: opens a chat with this bid's artisan. */
  onMessage?: (artisanId: string) => void;
  isMessageLoading?: boolean;
  isActionLoading?: boolean;
}

export function BidCard({
  bid,
  onAccept,
  onReject,
  onWithdraw,
  onMessage,
  isMessageLoading,
  isActionLoading,
}: BidCardProps) {
  const canAct = bid.status === "pending" && (onAccept || onReject);
  const canWithdraw = bid.status === "pending" && onWithdraw;
  const details = [
    bid.artisanRating !== null ? `★ ${bid.artisanRating}` : null,
    bid.artisanDistanceKm !== null ? `${bid.artisanDistanceKm} km away` : null,
  ].filter(Boolean);

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <span className={styles.avatar} aria-hidden="true">
          {bid.artisanInitials}
        </span>
        <div className={styles.identity}>
          <span className={styles.name}>{bid.artisanName}</span>
          {details.length > 0 && <span className="body-sm">{details.join(" · ")}</span>}
        </div>
        <Badge tone={bidStatusTone[bid.status]}>{statusLabel[bid.status]}</Badge>
      </div>

      <p className={`body-sm ${styles.message}`}>{bid.message}</p>

      <div className={styles.meta}>
        <span className={`num ${styles.amount}`}>₦{bid.amount.toLocaleString()}</span>
        <span className="body-sm">ETA {bid.etaMinutes} min</span>
      </div>

      {canAct && (
        <div className={styles.actions}>
          <Button
            variant="outline"
            size="sm"
            fullWidth
            disabled={isActionLoading}
            onClick={() => onReject?.(bid.id)}
          >
            Reject
          </Button>
          <Button
            size="sm"
            fullWidth
            isLoading={isActionLoading}
            onClick={() => onAccept?.(bid.id)}
          >
            Accept
          </Button>
        </div>
      )}

      {onMessage && (
        <Button
          variant="ghost"
          size="sm"
          fullWidth
          leftIcon={<FiMessageCircle />}
          isLoading={isMessageLoading}
          onClick={() => onMessage(bid.artisanId)}
        >
          Message {bid.artisanName.split(" ")[0]}
        </Button>
      )}

      {canWithdraw && (
        <div className={styles.actions}>
          <Button
            variant="outline"
            size="sm"
            fullWidth
            isLoading={isActionLoading}
            onClick={() => onWithdraw?.(bid.id)}
          >
            Withdraw bid
          </Button>
        </div>
      )}
    </div>
  );
}
