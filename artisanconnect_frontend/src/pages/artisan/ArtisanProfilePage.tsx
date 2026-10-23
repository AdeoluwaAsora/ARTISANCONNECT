import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { FiImage, FiAward, FiStar, FiSettings, FiCheckCircle } from "react-icons/fi";
import { usePageTitle } from "@/hooks/usePageTitle";
import { Card, Tabs, Badge } from "@/components/ui";
import { artisansApi } from "@/api/artisansApi";
import { ArtisanSettingsForm } from "@/features/artisans/components/ArtisanSettingsForm";
import { initialsOf } from "@/lib/initials";
import { tradeLabel } from "@/types/api";
import styles from "./ArtisanProfilePage.module.css";

const tabs = [
  { key: "portfolio", label: "Portfolio", icon: <FiImage size={15} /> },
  { key: "certificates", label: "Certificates", icon: <FiAward size={15} /> },
  { key: "reviews", label: "Reviews", icon: <FiStar size={15} /> },
  { key: "settings", label: "Settings", icon: <FiSettings size={15} /> },
];

export function ArtisanProfilePage() {
  usePageTitle("Profile & settings");
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") ?? "portfolio";

  const { data: profile, isLoading, error } = useQuery({
    queryKey: ["me"],
    queryFn: () => artisansApi.getMyProfile(),
  });

  if (isLoading) return <p className="body-sm">Loading your profile…</p>;
  if (error || !profile?.artisanProfile) {
    return (
      <p className="body-sm" role="alert">
        {error instanceof Error ? error.message : "Couldn't load your artisan profile."}
      </p>
    );
  }

  const artisan = profile.artisanProfile;
  const fullName = `${profile.firstName} ${profile.lastName}`;

  return (
    <div className={styles.page}>
      <Card className={styles.headerCard}>
        <span className={styles.avatar} aria-hidden="true">
          {initialsOf(fullName)}
        </span>
        <div className={styles.headerInfo}>
          <div className={styles.nameRow}>
            <h2 className="heading-lg">{fullName}</h2>
            {artisan.isVerified ? (
              <Badge tone="accent" icon={<FiCheckCircle />}>
                Verified
              </Badge>
            ) : (
              <Badge tone="warning">Not yet verified</Badge>
            )}
          </div>
          <p className="body-sm">
            {[
              tradeLabel(artisan.trade),
              `${artisan.yearsOfExperience} years experience`,
              artisan.city ?? "No service location set",
            ].join(" · ")}
          </p>
        </div>
      </Card>

      <Tabs items={tabs} activeKey={activeTab} onChange={(key) => setSearchParams({ tab: key })} />

      {activeTab === "portfolio" && (
        <Card>
          <p className="body-sm">
            Portfolio photos are coming soon. You'll be able to upload pictures of your work here.
          </p>
        </Card>
      )}

      {activeTab === "certificates" && (
        <Card>
          <p className="body-sm">
            Certificate uploads are coming soon. Once added and checked, they'll show as verified on
            your public profile.
          </p>
        </Card>
      )}

      {activeTab === "reviews" && (
        <Card>
          <p className="body-sm">
            No reviews yet. Customers will be able to review you after you complete a job.
          </p>
        </Card>
      )}

      {activeTab === "settings" && <ArtisanSettingsForm profile={profile} />}
    </div>
  );
}
