import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { usePageTitle } from "@/hooks/usePageTitle";
import { Card, Badge, Button } from "@/components/ui";
import { bidsApi } from "@/api/bidsApi";
import { bidStatusTone } from "@/features/bids/status";
import styles from "./ArtisanBidsPage.module.css";

export function ArtisanBidsPage() {
  usePageTitle("My bids");

  const { data: bids, isLoading } = useQuery({
    queryKey: ["bids", "mine"],
    queryFn: () => bidsApi.getMine(),
  });

  return (
    <div className={styles.page}>
      {isLoading ? (
        <p className="body-sm">Loading your bids…</p>
      ) : bids && bids.length > 0 ? (
        <div className={styles.list}>
          {bids.map((bid) => (
            <Card key={bid.id} className={styles.row}>
              <div className={styles.info}>
                <span className="heading-sm">{bid.jobTitle}</span>
                <span className="body-sm">
                  Submitted {new Date(bid.submittedAt).toLocaleDateString()}
                </span>
              </div>
              <span className={`num ${styles.amount}`}>₦{bid.amount.toLocaleString()}</span>
              <Badge
                tone={bidStatusTone[bid.status]}
              >
                {bid.status}
              </Badge>
              <Link to={`/jobs/${bid.jobId}`}>
                <Button size="sm" variant="outline">
                  View job
                </Button>
              </Link>
            </Card>
          ))}
        </div>
      ) : (
        <div className={styles.empty}>
          <p className="body-sm">You haven't submitted any bids yet.</p>
          <Link to="/artisan/jobs">
            <Button size="sm">Browse open jobs</Button>
          </Link>
        </div>
      )}
    </div>
  );
}
