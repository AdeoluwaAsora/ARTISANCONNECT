import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { FiMapPin, FiClock, FiX, FiCheckCircle, FiMessageCircle } from "react-icons/fi";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useAuth } from "@/store/AuthContext";
import { Card, Badge, Button } from "@/components/ui";
import { jobsApi } from "@/api/jobsApi";
import { bidsApi } from "@/services/mockBids";
import { BidCard } from "@/features/bids/components/BidCard";
import { SubmitBidForm } from "@/features/bids/components/SubmitBidForm";
import type { JobStatus } from "@/types/job";
import styles from "./JobDetailsPage.module.css";

const MOCK_SELF_ARTISAN_ID = "artisan-1";

const statusTone: Record<JobStatus, "neutral" | "info" | "success" | "warning" | "danger"> = {
  draft: "neutral",
  open: "info",
  assigned: "warning",
  in_progress: "warning",
  completed: "success",
  cancelled: "danger",
};

export function JobDetailsPage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const isArtisan = user?.role === "Artisan";
  const [actioningBidId, setActioningBidId] = useState<string | null>(null);
  const [isJobActionLoading, setIsJobActionLoading] = useState(false);

  const { data: job, isLoading: jobLoading } = useQuery({
    queryKey: ["jobs", id],
    queryFn: () => jobsApi.getById(id),
  });

  usePageTitle(job ? job.title : "Job details");

  const { data: bids, isLoading: bidsLoading } = useQuery({
    queryKey: ["bids", "job", id],
    queryFn: () => bidsApi.getForJob(id),
    enabled: Boolean(job),
  });

  const myBid = bids?.find((b) => b.artisanId === MOCK_SELF_ARTISAN_ID);

  const handleAccept = async (bidId: string) => {
    setActioningBidId(bidId);
    try {
      await bidsApi.accept(bidId);
      await queryClient.invalidateQueries({ queryKey: ["bids", "job", id] });
    } finally {
      setActioningBidId(null);
    }
  };

  const handleReject = async (bidId: string) => {
    setActioningBidId(bidId);
    try {
      await bidsApi.reject(bidId);
      await queryClient.invalidateQueries({ queryKey: ["bids", "job", id] });
    } finally {
      setActioningBidId(null);
    }
  };

  const handleCancel = async () => {
    setIsJobActionLoading(true);
    try {
      await jobsApi.cancel(id);
      await queryClient.invalidateQueries({ queryKey: ["jobs", id] });
    } finally {
      setIsJobActionLoading(false);
    }
  };

  const handleComplete = async () => {
    setIsJobActionLoading(true);
    try {
      await jobsApi.complete(id);
      await queryClient.invalidateQueries({ queryKey: ["jobs", id] });
    } finally {
      setIsJobActionLoading(false);
    }
  };

  if (jobLoading) return <p className="body-sm">Loading job…</p>;
  if (!job) return <p className="body-sm">Job not found.</p>;

  return (
    <div className={styles.page}>
      <Card className={styles.header}>
        <div className={styles.headerTop}>
          <Badge tone={statusTone[job.status]}>{job.status.replace("_", " ")}</Badge>
          <span className={styles.postedAt}>
            <FiClock size={12} aria-hidden="true" />
            Posted {new Date(job.postedAt).toLocaleDateString()}
          </span>
        </div>

        <h2 className="heading-lg">{job.title}</h2>
        <p className="body-base">{job.description}</p>

        <div className={styles.metaRow}>
          <span className={styles.metaItem}>
            <FiMapPin size={14} aria-hidden="true" /> {job.location}
          </span>
          <Badge tone="neutral">{job.trade}</Badge>
          <span className={`num ${styles.budget}`}>
            ₦{job.budgetMin.toLocaleString()} – ₦{job.budgetMax.toLocaleString()}
          </span>
        </div>

        {job.photos.length > 0 && (
          <div className={styles.photoGrid}>
            {job.photos.map((photo) => (
              <img key={photo.id} src={photo.url} alt="" className={styles.photo} />
            ))}
          </div>
        )}

        {!isArtisan && (
          <div className={styles.actions}>
            {job.status === "open" && (
              <Button
                variant="outline"
                leftIcon={<FiX />}
                onClick={handleCancel}
                isLoading={isJobActionLoading}
              >
                Cancel job
              </Button>
            )}
            {(job.status === "assigned" || job.status === "in_progress") && (
              <>
                <Button variant="outline" leftIcon={<FiMessageCircle />}>
                  Message {job.assignedArtisanName}
                </Button>
                <Button
                  leftIcon={<FiCheckCircle />}
                  onClick={handleComplete}
                  isLoading={isJobActionLoading}
                >
                  Mark as completed
                </Button>
              </>
            )}
          </div>
        )}
      </Card>

      {!isArtisan && job.status === "open" && (
        <section className={styles.section}>
          <h3 className="heading-md">Bids ({bids?.length ?? 0})</h3>
          {bidsLoading ? (
            <p className="body-sm">Loading bids…</p>
          ) : bids && bids.length > 0 ? (
            <div className={styles.bidsGrid}>
              {bids.map((bid) => (
                <BidCard
                  key={bid.id}
                  bid={bid}
                  onAccept={handleAccept}
                  onReject={handleReject}
                  isActionLoading={actioningBidId === bid.id}
                />
              ))}
            </div>
          ) : (
            <p className="body-sm">No bids yet — check back soon.</p>
          )}
        </section>
      )}

      {isArtisan && job.status === "open" && (
        <section className={styles.section}>
          <h3 className="heading-md">Your bid</h3>
          {myBid ? (
            <BidCard bid={myBid} />
          ) : (
            <SubmitBidForm
              jobId={job.id}
              artisanId={MOCK_SELF_ARTISAN_ID}
              onSubmitted={() => {
                queryClient.invalidateQueries({ queryKey: ["bids", "job", id] });
                navigate("/artisan/bids");
              }}
            />
          )}
        </section>
      )}
    </div>
  );
}
