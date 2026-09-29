import { useState } from "react";
import { Link } from "react-router-dom";
import { PulseDot, Button } from "@/components/ui";
import type { ArtisanProfile } from "@/types/artisan";
import styles from "./ArtisansMapView.module.css";

export interface ArtisansMapViewProps {
  artisans: ArtisanProfile[];
}

/** Deterministic pseudo-position so the same artisan always lands in the same spot. */
function positionFor(id: string): { top: string; left: string } {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  const top = 12 + (hash % 76); // keep within 12%–88%
  const left = 10 + ((hash >> 4) % 80); // keep within 10%–90%
  return { top: `${top}%`, left: `${left}%` };
}

/**
 * NOTE: This is a stylized placeholder map, not a real Google Maps/Mapbox
 * embed — that requires an API key and a live network connection to the
 * maps provider, which isn't available in this environment. Swap this
 * component's internals for <GoogleMap> or <Map> from @vis.gl/react-google-maps
 * or react-map-gl once a key is available; the artisan positioning logic
 * and click-to-select behavior can stay the same.
 */
export function ArtisansMapView({ artisans }: ArtisansMapViewProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = artisans.find((a) => a.id === selectedId);

  return (
    <div className={styles.frame}>
      <div className={styles.gridBackground} aria-hidden="true" />

      <div className={styles.centerMarker}>
        <span className={styles.centerDot} />
        <span className={styles.centerLabel}>You</span>
      </div>

      {artisans.map((artisan) => {
        const pos = positionFor(artisan.id);
        return (
          <button
            key={artisan.id}
            type="button"
            className={`${styles.pin} ${selectedId === artisan.id ? styles.pinActive : ""}`}
            style={{ top: pos.top, left: pos.left }}
            onClick={() => setSelectedId(artisan.id)}
            aria-label={`${artisan.name}, ${artisan.trade}, ${artisan.distanceKm} km away`}
          >
            <PulseDot tone={artisan.isOnline ? "accent" : "slate"} animated={artisan.isOnline} />
          </button>
        );
      })}

      {selected && (
        <div className={styles.popover}>
          <div className={styles.popoverHeader}>
            <span className={styles.popoverAvatar}>{selected.initials}</span>
            <div>
              <p className={styles.popoverName}>{selected.name}</p>
              <p className="body-sm">{selected.trade}</p>
            </div>
          </div>
          <p className="body-sm">
            ★ {selected.rating} · {selected.distanceKm} km away
          </p>
          <Link to={`/artisans/${selected.id}`}>
            <Button size="sm" fullWidth>
              View profile
            </Button>
          </Link>
        </div>
      )}

      <div className={styles.legend}>
        <span className={styles.legendItem}>
          <PulseDot tone="accent" size="sm" animated={false} /> Online
        </span>
        <span className={styles.legendItem}>
          <PulseDot tone="slate" size="sm" animated={false} /> Offline
        </span>
      </div>
    </div>
  );
}
