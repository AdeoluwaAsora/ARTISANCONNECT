import { Link } from "react-router-dom";
import { FiCheckCircle, FiHeart } from "react-icons/fi";
import { Card, Badge, PulseDot, Button } from "@/components/ui";
import type { ArtisanProfile } from "@/types/artisan";
import styles from "./ArtisanCard.module.css";

export interface ArtisanCardProps {
  artisan: ArtisanProfile;
  isSaved?: boolean;
  onToggleSave?: (id: string) => void;
  compact?: boolean;
}

export function ArtisanCard({
  artisan,
  isSaved = false,
  onToggleSave,
  compact = false,
}: ArtisanCardProps) {
  return (
    <Card interactive className={styles.card}>
      <div className={styles.header}>
        <div className={styles.avatarWrap}>
          <span className={styles.avatar} aria-hidden="true">
            {artisan.initials}
          </span>
          {artisan.isOnline && (
            <span className={styles.onlineDot}>
              <PulseDot tone="accent" size="sm" />
            </span>
          )}
        </div>

        {onToggleSave && (
          <button
            type="button"
            className={`${styles.saveButton} ${isSaved ? styles.saveButtonActive : ""}`}
            onClick={() => onToggleSave(artisan.id)}
            aria-label={isSaved ? "Remove from saved" : "Save artisan"}
            aria-pressed={isSaved}
          >
            <FiHeart size={18} fill={isSaved ? "currentColor" : "none"} />
          </button>
        )}
      </div>

      <h3 className={`heading-sm ${styles.name}`}>{artisan.name}</h3>
      <p className="body-sm">{artisan.trade}</p>

      <div className={styles.badges}>
        {artisan.isVerified && (
          <Badge tone="accent" icon={<FiCheckCircle />}>
            Verified
          </Badge>
        )}
        {artisan.distanceKm !== null && <Badge tone="neutral">{artisan.distanceKm} km away</Badge>}
      </div>

      {!compact && artisan.bio && <p className={`body-sm ${styles.bio}`}>{artisan.bio}</p>}

      <div className={styles.footer}>
        <span className={`num ${styles.rating}`}>
          {artisan.rating !== null ? (
            <>
              ★ {artisan.rating} <span className={styles.reviewCount}>({artisan.reviewCount ?? 0})</span>
            </>
          ) : (
            <span className={styles.reviewCount}>{artisan.yearsExperience} yrs experience</span>
          )}
        </span>
        <span className={`num ${styles.rate}`}>
          {artisan.hourlyRate !== null ? `₦${artisan.hourlyRate.toLocaleString()}/hr` : "Rate on request"}
        </span>
      </div>

      <Link to={`/artisans/${artisan.id}`}>
        <Button variant="outline" size="sm" fullWidth>
          View profile
        </Button>
      </Link>
    </Card>
  );
}
