import { Badge, Button } from "@/components/ui";
import type { Bid, BidStatus } from "@/types/bid";
import styles from "./BidCard.module.css";

const statusTone: Record<BidStatus, "neutral" | "success" | "danger" | "warning"> = {
  pending: "warning",
  accepted: "success",
  rejected: "danger",
  withdrawn: "neutral",
};

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
  isActionLoading?: boolean;
}

export function BidCard({ bid, onAccept, onReject, isActionLoading }: BidCardProps) {
  const canAct = bid.status === "pending" && (onAccept || onReject);

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <span className={styles.avatar} aria-hidden="true">
          {bid.artisanInitials}
        </span>
        <div className={styles.identity}>
          <span className={styles.name}>{bid.artisanName}</span>
          <span className="body-sm">
            ★ {bid.artisanRating} · {bid.artisanDistanceKm} km away
          </span>
        </div>
        <Badge tone={statusTone[bid.status]}>{statusLabel[bid.status]}</Badge>
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
    </div>
  );
}
