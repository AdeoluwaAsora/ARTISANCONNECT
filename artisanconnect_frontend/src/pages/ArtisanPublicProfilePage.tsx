import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { FiCheckCircle, FiMessageCircle, FiMapPin } from "react-icons/fi";
import { usePageTitle } from "@/hooks/usePageTitle";
import { Card, Badge, Button, PulseDot } from "@/components/ui";
import { artisansApi } from "@/api/artisansApi";
import { useSearchOrigin } from "@/features/artisans/useSearchOrigin";
import { useStartChat } from "@/features/chat/useStartChat";
import { useAuth } from "@/store/AuthContext";
import styles from "./ArtisanPublicProfilePage.module.css";

export function ArtisanPublicProfilePage() {
  const { id = "" } = useParams();
  const { origin } = useSearchOrigin();
  const { user } = useAuth();
  const isCustomer = user?.role === "Customer";
  const { startChat, startingWith, error: chatError } = useStartChat();
  const { data: artisan, isLoading } = useQuery({
    queryKey: ["artisans", id, origin],
    queryFn: () => artisansApi.getById(id, origin),
  });

  usePageTitle(artisan ? artisan.name : "Artisan profile");

  if (isLoading) return <p className="body-sm">Loading profile…</p>;
  if (!artisan) return <p className="body-sm">Artisan not found.</p>;

  return (
    <div className={styles.page}>
      <Card className={styles.headerCard}>
        <div className={styles.headerTop}>
          <span className={styles.avatar} aria-hidden="true">
            {artisan.initials}
          </span>
          <div className={styles.headerInfo}>
            <div className={styles.nameRow}>
              <h2 className="heading-lg">{artisan.name}</h2>
              {artisan.isVerified && (
                <Badge tone="accent" icon={<FiCheckCircle />}>
                  Verified
                </Badge>
              )}
              {artisan.isOnline && <PulseDot tone="accent" label="Online now" size="sm" />}
            </div>
            <p className="body-base">{artisan.trade}</p>
            <p className="body-sm">
              {[
                artisan.rating !== null ? `★ ${artisan.rating} (${artisan.reviewCount ?? 0} reviews)` : null,
                `${artisan.jobsCompleted} jobs completed`,
                `${artisan.yearsExperience} years experience`,
              ]
                .filter(Boolean)
                .join(" · ")}
            </p>
            {(artisan.city || artisan.distanceKm !== null) && (
              <p className={styles.location}>
                <FiMapPin size={13} aria-hidden="true" />{" "}
                {[artisan.city, artisan.distanceKm !== null ? `${artisan.distanceKm} km away` : null]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            )}
          </div>
        </div>

        <div className={styles.headerActions}>
          <span className={`num ${styles.rate}`}>
            {artisan.hourlyRate !== null ? `₦${artisan.hourlyRate.toLocaleString()}/hr` : "Rate on request"}
          </span>
          <div className={styles.actionButtons}>
            {isCustomer && (
              <>
                <Button
                  variant="outline"
                  leftIcon={<FiMessageCircle />}
                  isLoading={startingWith === artisan.id}
                  onClick={() => void startChat(artisan.id)}
                >
                  Message
                </Button>
                <Link to="/jobs/post">
                  <Button>Request a quote</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </Card>

      {chatError && (
        <p className="body-sm" role="alert">
          {chatError}
        </p>
      )}

      <Card>
        <h3 className="heading-sm">About</h3>
        <p className={`body-base ${styles.bio}`}>
          {artisan.bio || `${artisan.name.split(" ")[0]} hasn't added a bio yet.`}
        </p>
        <div className={styles.skills}>
          {artisan.skills.map((skill) => (
            <Badge key={skill} tone="neutral">
              {skill}
            </Badge>
          ))}
        </div>
      </Card>

      <Card>
        <h3 className="heading-sm">Portfolio</h3>
        {artisan.portfolio.length === 0 && <p className="body-sm">No portfolio photos yet.</p>}
        <div className={styles.portfolioGrid}>
          {artisan.portfolio.map((item) => (
            <div key={item.id} className={styles.portfolioTile}>
              <span className={styles.portfolioPlaceholder} aria-hidden="true" />
              <span className={styles.portfolioCaption}>{item.caption}</span>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <h3 className="heading-sm">Certificates</h3>
        {artisan.certificates.length === 0 && <p className="body-sm">No certificates added yet.</p>}
        <div className={styles.certList}>
          {artisan.certificates.map((cert) => (
            <div key={cert.id} className={styles.certRow}>
              <div>
                <p className={styles.certName}>{cert.name}</p>
                <p className="body-sm">
                  {cert.issuer} · {cert.issuedYear}
                </p>
              </div>
              {cert.verified && (
                <Badge tone="accent" icon={<FiCheckCircle />}>
                  Verified
                </Badge>
              )}
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <h3 className="heading-sm">Reviews</h3>
        {artisan.reviews.length === 0 && <p className="body-sm">No reviews yet.</p>}
        <div className={styles.reviewsList}>
          {artisan.reviews.map((review) => (
            <div key={review.id} className={styles.reviewRow}>
              <div className={styles.reviewHeader}>
                <span className="heading-sm">{review.customerName}</span>
                <span className={`num ${styles.reviewRating}`}>★ {review.rating}</span>
              </div>
              <p className="body-sm">{review.comment}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
