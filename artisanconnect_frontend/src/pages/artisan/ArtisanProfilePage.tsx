import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { FiImage, FiAward, FiStar, FiSettings, FiCheckCircle, FiPlus } from "react-icons/fi";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useAuth } from "@/store/AuthContext";
import { Card, Tabs, Badge, Button } from "@/components/ui";
import { Input, Select } from "@/components/forms";
import { artisansApi } from "@/services/mockArtisans";
import styles from "./ArtisanProfilePage.module.css";

const MOCK_SELF_ARTISAN_ID = "artisan-1";

const tabs = [
  { key: "portfolio", label: "Portfolio", icon: <FiImage size={15} /> },
  { key: "certificates", label: "Certificates", icon: <FiAward size={15} /> },
  { key: "reviews", label: "Reviews", icon: <FiStar size={15} /> },
  { key: "settings", label: "Settings", icon: <FiSettings size={15} /> },
];

const tradeOptions = [
  { value: "Electrician", label: "Electrician" },
  { value: "Plumber", label: "Plumber" },
  { value: "Carpenter", label: "Carpenter" },
];

export function ArtisanProfilePage() {
  usePageTitle("Profile & settings");
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("portfolio");

  const { data: artisan } = useQuery({
    queryKey: ["artisans", MOCK_SELF_ARTISAN_ID],
    queryFn: () => artisansApi.getById(MOCK_SELF_ARTISAN_ID),
  });

  return (
    <div className={styles.page}>
      <Card className={styles.headerCard}>
        <span className={styles.avatar} aria-hidden="true">
          {user ? `${user.firstName[0]}${user.lastName[0]}` : "?"}
        </span>
        <div className={styles.headerInfo}>
          <div className={styles.nameRow}>
            <h2 className="heading-lg">
              {user ? `${user.firstName} ${user.lastName}` : "Guest"}
            </h2>
            <Badge tone="accent" icon={<FiCheckCircle />}>
              Verified
            </Badge>
          </div>
          <p className="body-sm">
            {artisan?.trade} · ★ {artisan?.rating} ({artisan?.reviewCount} reviews) ·{" "}
            {artisan?.jobsCompleted} jobs completed
          </p>
        </div>
      </Card>

      <Tabs items={tabs} activeKey={activeTab} onChange={setActiveTab} />

      {activeTab === "portfolio" && (
        <div className={styles.portfolioGrid}>
          <button type="button" className={styles.addTile}>
            <FiPlus size={22} />
            <span className="body-sm">Add photo</span>
          </button>
          {artisan?.portfolio.map((item) => (
            <div key={item.id} className={styles.portfolioTile}>
              <span className={styles.portfolioPlaceholder} aria-hidden="true" />
              <span className={styles.portfolioCaption}>{item.caption}</span>
            </div>
          ))}
        </div>
      )}

      {activeTab === "certificates" && (
        <div className={styles.certList}>
          {artisan?.certificates.map((cert) => (
            <Card key={cert.id} className={styles.certCard}>
              <div>
                <h4 className="heading-sm">{cert.name}</h4>
                <p className="body-sm">
                  {cert.issuer} · Issued {cert.issuedYear}
                </p>
              </div>
              {cert.verified ? (
                <Badge tone="accent" icon={<FiCheckCircle />}>
                  Verified
                </Badge>
              ) : (
                <Badge tone="warning">Pending review</Badge>
              )}
            </Card>
          ))}
          <Button variant="outline" leftIcon={<FiPlus />} className={styles.addCertButton}>
            Add certificate
          </Button>
        </div>
      )}

      {activeTab === "reviews" && (
        <div className={styles.reviewsList}>
          {artisan?.reviews.map((review) => (
            <Card key={review.id} className={styles.reviewCard}>
              <div className={styles.reviewHeader}>
                <span className="heading-sm">{review.customerName}</span>
                <span className={`num ${styles.reviewRating}`}>★ {review.rating}</span>
              </div>
              <p className="body-sm">{review.comment}</p>
            </Card>
          ))}
        </div>
      )}

      {activeTab === "settings" && (
        <Card className={styles.settingsCard}>
          <h3 className="heading-sm">Profile information</h3>
          <div className={styles.settingsForm}>
            <Input label="First name" defaultValue={user?.firstName} />
            <Input label="Last name" defaultValue={user?.lastName} />
            <Input label="Email address" type="email" defaultValue={user?.email} />
            <Select label="Primary trade" options={tradeOptions} defaultValue={artisan?.trade} />
            <Input label="Hourly rate (₦)" type="number" defaultValue={artisan?.hourlyRate} />
          </div>
          <Button className={styles.saveButton}>Save changes</Button>
        </Card>
      )}
    </div>
  );
}
