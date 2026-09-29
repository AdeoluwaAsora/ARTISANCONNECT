import { Link } from "react-router-dom";
import { FiMapPin, FiClock } from "react-icons/fi";
import { Card, Badge } from "@/components/ui";
import type { Job, JobStatus } from "@/types/job";
import styles from "./JobCard.module.css";

const statusTone: Record<JobStatus, "neutral" | "info" | "success" | "warning" | "danger"> = {
  draft: "neutral",
  open: "info",
  assigned: "warning",
  in_progress: "warning",
  completed: "success",
  cancelled: "danger",
};

const statusLabel: Record<JobStatus, string> = {
  draft: "Draft",
  open: "Open for bids",
  assigned: "Assigned",
  in_progress: "In progress",
  completed: "Completed",
  cancelled: "Cancelled",
};

function timeAgo(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  if (hours < 1) return "Just now";
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export interface JobCardProps {
  job: Job;
}

export function JobCard({ job }: JobCardProps) {
  return (
    <Card interactive className={styles.card}>
      <div className={styles.top}>
        <Badge tone={statusTone[job.status]}>{statusLabel[job.status]}</Badge>
        <span className={styles.postedAt}>
          <FiClock size={12} aria-hidden="true" />
          {timeAgo(job.postedAt)}
        </span>
      </div>

      <h3 className={`heading-sm ${styles.title}`}>{job.title}</h3>
      <p className={`body-sm ${styles.description}`}>{job.description}</p>

      <div className={styles.meta}>
        <span className={styles.metaItem}>
          <FiMapPin size={13} aria-hidden="true" />
          {job.location}
        </span>
        <Badge tone="neutral">{job.trade}</Badge>
      </div>

      <div className={styles.footer}>
        <span className={`num ${styles.budget}`}>
          ₦{job.budgetMin.toLocaleString()} – ₦{job.budgetMax.toLocaleString()}
        </span>
        {job.status === "open" && (
          <span className="body-sm">{job.bidCount} bids</span>
        )}
        {job.assignedArtisanName && (
          <span className="body-sm">{job.assignedArtisanName}</span>
        )}
      </div>

      <Link to={`/jobs/${job.id}`} className={styles.link}>
        View details
      </Link>
    </Card>
  );
}
