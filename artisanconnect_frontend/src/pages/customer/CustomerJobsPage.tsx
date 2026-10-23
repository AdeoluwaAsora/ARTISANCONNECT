import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { FiPlusCircle } from "react-icons/fi";
import { usePageTitle } from "@/hooks/usePageTitle";
import { Tabs, Button } from "@/components/ui";
import { JobCard } from "@/components/common/JobCard";
import { jobsApi } from "@/api/jobsApi";
import type { JobStatus } from "@/types/job";
import styles from "./CustomerJobsPage.module.css";

const tabs: { key: JobStatus | "all"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "open", label: "Open" },
  { key: "assigned", label: "Assigned" },
  { key: "in_progress", label: "In progress" },
  { key: "completed", label: "Completed" },
  { key: "cancelled", label: "Cancelled" },
];

export function CustomerJobsPage() {
  usePageTitle("My jobs");
  const [activeTab, setActiveTab] = useState<JobStatus | "all">("all");

  const { data: jobs, isLoading } = useQuery({
    queryKey: ["jobs", "mine"],
    queryFn: () => jobsApi.getMyJobs(),
  });

  const filtered = jobs?.filter((j) => activeTab === "all" || j.status === activeTab);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <Tabs
          items={tabs.map((t) => ({ key: t.key, label: t.label }))}
          activeKey={activeTab}
          onChange={(key) => setActiveTab(key as JobStatus | "all")}
        />
        <Link to="/jobs/post">
          <Button size="sm" leftIcon={<FiPlusCircle />}>
            Post a job
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <p className="body-sm">Loading your jobs…</p>
      ) : filtered && filtered.length > 0 ? (
        <div className={styles.grid}>
          {filtered.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      ) : (
        <p className="body-sm">No jobs in this category yet.</p>
      )}
    </div>
  );
}
