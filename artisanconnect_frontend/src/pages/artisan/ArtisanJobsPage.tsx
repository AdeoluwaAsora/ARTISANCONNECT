import { useQuery } from "@tanstack/react-query";
import { usePageTitle } from "@/hooks/usePageTitle";
import { JobCard } from "@/components/common/JobCard";
import { jobsApi } from "@/api/jobsApi";
import styles from "./ArtisanJobsPage.module.css";

export function ArtisanJobsPage() {
  usePageTitle("Find jobs");

  const { data: jobs, isLoading } = useQuery({
    queryKey: ["jobs", "open"],
    queryFn: () => jobsApi.getOpenJobs(),
  });

  return (
    <div className={styles.page}>
      <p className="body-sm">
        {isLoading ? "Loading open jobs…" : `${jobs?.length ?? 0} open jobs near you`}
      </p>

      {!isLoading && (
        <div className={styles.grid}>
          {jobs?.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
          {jobs?.length === 0 && (
            <p className="body-sm">No open jobs right now — check back soon.</p>
          )}
        </div>
      )}
    </div>
  );
}
