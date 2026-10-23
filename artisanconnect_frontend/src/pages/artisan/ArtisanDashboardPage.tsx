import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { FiBriefcase, FiCheckCircle, FiClock, FiDollarSign } from "react-icons/fi";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useAuth } from "@/store/AuthContext";
import { StatCard } from "@/components/common/StatCard";
import { JobCard } from "@/components/common/JobCard";
import { Badge, Button, Card, Switch } from "@/components/ui";
import { jobsApi } from "@/api/jobsApi";
import { bidsApi } from "@/services/mockBids";
import styles from "./ArtisanDashboardPage.module.css";

// Using artisan-1 as the mock "self" record until the backend exposes a
// real artisan profile tied to the logged-in user.
const MOCK_SELF_ARTISAN_ID = "artisan-1";

export function ArtisanDashboardPage() {
  usePageTitle("Dashboard");
  const { user } = useAuth();
  const [isOnline, setIsOnline] = useState(true);

  const { data: openJobs, isLoading: jobsLoading } = useQuery({
    queryKey: ["jobs", "open"],
    queryFn: () => jobsApi.getOpenJobs(),
  });

  const { data: myBids, isLoading: bidsLoading } = useQuery({
    queryKey: ["bids", "mine"],
    queryFn: () => bidsApi.getByArtisan(MOCK_SELF_ARTISAN_ID),
  });

  const pendingBids = myBids?.filter((b) => b.status === "pending").length ?? 0;
  const acceptedBids = myBids?.filter((b) => b.status === "accepted").length ?? 0;

  return (
    <div className={styles.page}>
      <Card className={styles.welcomeCard}>
        <div>
          <div className={styles.welcomeTop}>
            <h2 className="heading-lg">Welcome back, {user?.firstName ?? "there"}</h2>
            <Badge tone="accent" icon={<FiCheckCircle />}>
              Verified
            </Badge>
          </div>
          <p className="body-base">Here's your activity for today.</p>
        </div>
        <Switch checked={isOnline} onChange={setIsOnline} label={isOnline ? "Online" : "Offline"} />
      </Card>

      <div className={styles.statsGrid}>
        <StatCard label="Jobs today" value="2" icon={<FiBriefcase size={20} />} tone="primary" />
        <StatCard
          label="Pending bids"
          value={String(pendingBids)}
          icon={<FiClock size={20} />}
          tone="secondary"
        />
        <StatCard
          label="Active jobs"
          value={String(acceptedBids)}
          icon={<FiCheckCircle size={20} />}
          tone="accent"
        />
        <StatCard label="This month" value="₦186,000" icon={<FiDollarSign size={20} />} tone="primary" />
      </div>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h3 className="heading-md">Open jobs near you</h3>
          <Link to="/artisan/jobs" className={styles.sectionLink}>
            View all
          </Link>
        </div>
        {jobsLoading ? (
          <p className="body-sm">Loading nearby jobs…</p>
        ) : (
          <div className={styles.jobsGrid}>
            {openJobs?.slice(0, 3).map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        )}
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h3 className="heading-md">Your recent bids</h3>
          <Link to="/artisan/bids" className={styles.sectionLink}>
            View all
          </Link>
        </div>
        {bidsLoading ? (
          <p className="body-sm">Loading your bids…</p>
        ) : myBids && myBids.length > 0 ? (
          <div className={styles.bidsList}>
            {myBids.map((bid) => (
              <Card key={bid.id} className={styles.bidRow}>
                <span className="body-sm">Job #{bid.jobId.replace("job-", "")}</span>
                <span className={`num ${styles.bidAmount}`}>₦{bid.amount.toLocaleString()}</span>
                <Badge
                  tone={
                    bid.status === "accepted"
                      ? "success"
                      : bid.status === "rejected"
                        ? "danger"
                        : "warning"
                  }
                >
                  {bid.status}
                </Badge>
              </Card>
            ))}
          </div>
        ) : (
          <div className={styles.emptyState}>
            <p className="body-sm">You haven't placed any bids yet.</p>
            <Link to="/artisan/jobs">
              <Button size="sm" variant="outline">
                Browse open jobs
              </Button>
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
