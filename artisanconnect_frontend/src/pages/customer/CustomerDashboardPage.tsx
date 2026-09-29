import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { FiBriefcase, FiCheckCircle, FiHeart, FiPlusCircle, FiSearch } from "react-icons/fi";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useAuth } from "@/store/AuthContext";
import { StatCard } from "@/components/common/StatCard";
import { JobCard } from "@/components/common/JobCard";
import { ArtisanCard } from "@/features/artisans/components/ArtisanCard";
import { Button, Card } from "@/components/ui";
import { jobsApi } from "@/services/mockJobs";
import { artisansApi } from "@/services/mockArtisans";
import styles from "./CustomerDashboardPage.module.css";

export function CustomerDashboardPage() {
  usePageTitle("Dashboard");
  const { user } = useAuth();

  const { data: jobs, isLoading: jobsLoading } = useQuery({
    queryKey: ["jobs", "mine"],
    queryFn: () => jobsApi.getMyJobs(),
  });

  const { data: recommended, isLoading: artisansLoading } = useQuery({
    queryKey: ["artisans", "recommended"],
    queryFn: () => artisansApi.getNearby(),
  });

  const activeJobs = jobs?.filter((j) => j.status === "assigned" || j.status === "in_progress") ?? [];
  const completedCount = jobs?.filter((j) => j.status === "completed").length ?? 0;
  const openCount = jobs?.filter((j) => j.status === "open").length ?? 0;

  return (
    <div className={styles.page}>
      <Card className={styles.welcomeCard}>
        <div>
          <h2 className="heading-lg">Welcome back, {user?.firstName ?? "there"} 👋</h2>
          <p className="body-base">Here's what's happening with your jobs today.</p>
        </div>
        <div className={styles.quickActions}>
          <Link to="/jobs/post">
            <Button leftIcon={<FiPlusCircle />}>Post a job</Button>
          </Link>
          <Link to="/find-artisans">
            <Button variant="outline" leftIcon={<FiSearch />}>
              Find artisans
            </Button>
          </Link>
        </div>
      </Card>

      <div className={styles.statsGrid}>
        <StatCard
          label="Active jobs"
          value={String(activeJobs.length)}
          icon={<FiBriefcase size={20} />}
          tone="primary"
        />
        <StatCard
          label="Awaiting bids"
          value={String(openCount)}
          icon={<FiSearch size={20} />}
          tone="secondary"
        />
        <StatCard
          label="Completed"
          value={String(completedCount)}
          icon={<FiCheckCircle size={20} />}
          tone="accent"
        />
        <StatCard
          label="Saved artisans"
          value="4"
          icon={<FiHeart size={20} />}
          tone="primary"
        />
      </div>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h3 className="heading-md">Your jobs</h3>
          <Link to="/customer/jobs" className={styles.sectionLink}>
            View all
          </Link>
        </div>
        {jobsLoading ? (
          <p className="body-sm">Loading your jobs…</p>
        ) : jobs && jobs.length > 0 ? (
          <div className={styles.jobsGrid}>
            {jobs.slice(0, 3).map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        ) : (
          <p className="body-sm">You haven't posted any jobs yet.</p>
        )}
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h3 className="heading-md">Recommended near you</h3>
          <Link to="/find-artisans" className={styles.sectionLink}>
            See more
          </Link>
        </div>
        {artisansLoading ? (
          <p className="body-sm">Finding artisans near you…</p>
        ) : (
          <div className={styles.artisansGrid}>
            {recommended?.slice(0, 4).map((artisan) => (
              <ArtisanCard key={artisan.id} artisan={artisan} compact />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
