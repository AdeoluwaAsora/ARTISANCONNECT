import { FiCheckCircle } from "react-icons/fi";
import { Card, Badge, PulseDot, Button } from "@/components/ui";
import styles from "./FeaturedArtisans.module.css";

interface Artisan {
  name: string;
  trade: string;
  rating: string;
  jobs: number;
  distanceKm: number;
  online: boolean;
  initials: string;
}

const artisans: Artisan[] = [
  { name: "Chidi Okafor", trade: "Electrician", rating: "4.9", jobs: 312, distanceKm: 1.2, online: true, initials: "CO" },
  { name: "Amaka Titus", trade: "Plumber", rating: "5.0", jobs: 208, distanceKm: 0.8, online: true, initials: "AT" },
  { name: "Bala Musa", trade: "Carpenter", rating: "4.8", jobs: 176, distanceKm: 2.4, online: false, initials: "BM" },
  { name: "Ngozi Eze", trade: "AC Technician", rating: "4.9", jobs: 264, distanceKm: 1.7, online: true, initials: "NE" },
];

export function FeaturedArtisans() {
  return (
    <section className={styles.section}>
      <div className="container">
        <div className={styles.heading}>
          <span className="eyebrow">Top-rated this month</span>
          <h2 className="display-2">Artisans your neighbors keep rehiring</h2>
        </div>

        <div className={styles.grid}>
          {artisans.map((artisan) => (
            <Card key={artisan.name} interactive className={styles.card}>
              <div className={styles.avatarRow}>
                <span className={styles.avatar} aria-hidden="true">
                  {artisan.initials}
                </span>
                {artisan.online && (
                  <span className={styles.onlineTag}>
                    <PulseDot tone="accent" size="sm" />
                  </span>
                )}
              </div>

              <h3 className={`heading-sm ${styles.name}`}>{artisan.name}</h3>
              <p className="body-sm">{artisan.trade}</p>

              <div className={styles.badges}>
                <Badge tone="accent" icon={<FiCheckCircle />}>
                  Verified
                </Badge>
                <Badge tone="neutral">{artisan.distanceKm} km away</Badge>
              </div>

              <div className={styles.footer}>
                <span className={`num ${styles.rating}`}>★ {artisan.rating}</span>
                <span className="body-sm">{artisan.jobs} jobs</span>
              </div>

              <Button variant="outline" size="sm" fullWidth>
                View profile
              </Button>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
