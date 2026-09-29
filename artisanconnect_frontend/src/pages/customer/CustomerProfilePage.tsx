import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { FiUser, FiHeart, FiClock, FiSettings } from "react-icons/fi";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useAuth } from "@/store/AuthContext";
import { Card, Tabs, Button } from "@/components/ui";
import { Input } from "@/components/forms";
import { ArtisanCard } from "@/features/artisans/components/ArtisanCard";
import { JobCard } from "@/components/common/JobCard";
import { artisansApi } from "@/services/mockArtisans";
import { jobsApi } from "@/services/mockJobs";
import styles from "./CustomerProfilePage.module.css";

const tabs = [
  { key: "overview", label: "Overview", icon: <FiUser size={15} /> },
  { key: "saved", label: "Saved artisans", icon: <FiHeart size={15} /> },
  { key: "history", label: "Job history", icon: <FiClock size={15} /> },
  { key: "settings", label: "Settings", icon: <FiSettings size={15} /> },
];

export function CustomerProfilePage() {
  usePageTitle("Profile & settings");
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") ?? "overview";

  const { data: savedArtisans } = useQuery({
    queryKey: ["artisans", "saved"],
    queryFn: () => artisansApi.getNearby(),
  });

  const { data: jobs } = useQuery({
    queryKey: ["jobs", "mine"],
    queryFn: () => jobsApi.getMyJobs(),
  });

  return (
    <div className={styles.page}>
      <Card className={styles.headerCard}>
        <span className={styles.avatar} aria-hidden="true">
          {user ? `${user.firstName[0]}${user.lastName[0]}` : "?"}
        </span>
        <div>
          <h2 className="heading-lg">
            {user ? `${user.firstName} ${user.lastName}` : "Guest"}
          </h2>
          <p className="body-sm">{user?.email}</p>
        </div>
      </Card>

      <Tabs items={tabs} activeKey={activeTab} onChange={(key) => setSearchParams({ tab: key })} />

      {activeTab === "overview" && (
        <div className={styles.overviewGrid}>
          <Card>
            <h3 className="heading-sm">Account details</h3>
            <dl className={styles.detailList}>
              <div>
                <dt className="body-sm">Full name</dt>
                <dd className="body-base">{user ? `${user.firstName} ${user.lastName}` : "—"}</dd>
              </div>
              <div>
                <dt className="body-sm">Email</dt>
                <dd className="body-base">{user?.email ?? "—"}</dd>
              </div>
              <div>
                <dt className="body-sm">Account type</dt>
                <dd className="body-base">{user?.role ?? "—"}</dd>
              </div>
            </dl>
          </Card>
          <Card>
            <h3 className="heading-sm">Activity summary</h3>
            <p className="body-base">{jobs?.length ?? 0} jobs posted in total.</p>
            <p className="body-base">{savedArtisans?.length ?? 0} artisans saved.</p>
          </Card>
        </div>
      )}

      {activeTab === "saved" && (
        <div className={styles.grid}>
          {savedArtisans?.slice(0, 6).map((artisan) => (
            <ArtisanCard key={artisan.id} artisan={artisan} compact />
          ))}
        </div>
      )}

      {activeTab === "history" && (
        <div className={styles.grid}>
          {jobs?.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
          {jobs?.length === 0 && <p className="body-sm">No job history yet.</p>}
        </div>
      )}

      {activeTab === "settings" && (
        <Card className={styles.settingsCard}>
          <h3 className="heading-sm">Personal information</h3>
          <div className={styles.settingsForm}>
            <Input label="First name" defaultValue={user?.firstName} />
            <Input label="Last name" defaultValue={user?.lastName} />
            <Input label="Email address" type="email" defaultValue={user?.email} />
            <Input label="Phone number" type="tel" placeholder="e.g. 08012345678" />
          </div>
          <Button className={styles.saveButton}>Save changes</Button>
        </Card>
      )}
    </div>
  );
}
