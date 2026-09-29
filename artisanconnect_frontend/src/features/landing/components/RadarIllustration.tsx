import styles from "./RadarIllustration.module.css";

interface ArtisanBlip {
  id: string;
  top: string;
  left: string;
  delay: string;
  chip?: { name: string; rating: string };
}

const blips: ArtisanBlip[] = [
  { id: "a1", top: "28%", left: "62%", delay: "0s", chip: { name: "Chidi O.", rating: "4.9" } },
  { id: "a2", top: "58%", left: "74%", delay: "0.4s" },
  { id: "a3", top: "68%", left: "34%", delay: "0.8s", chip: { name: "Amaka T.", rating: "5.0" } },
  { id: "a4", top: "22%", left: "30%", delay: "1.1s" },
  { id: "a5", top: "45%", left: "46%", delay: "1.5s" },
];

/**
 * The brand signature: a live-radar visualization standing in for the
 * generic hero image or stat block. It renders the product's actual
 * differentiator — real-time proximity — as the first thing a visitor sees.
 */
export function RadarIllustration() {
  return (
    <div className={styles.frame} role="img" aria-label="Map showing several verified artisans currently online nearby">
      <svg viewBox="0 0 400 400" className={styles.rings} aria-hidden="true">
        <circle cx="200" cy="200" r="180" className={styles.ringOuter} />
        <circle cx="200" cy="200" r="128" className={styles.ringMid} />
        <circle cx="200" cy="200" r="72" className={styles.ringInner} />
      </svg>

      <div className={styles.center}>
        <span className={styles.centerDot} />
        <span className={styles.centerLabel}>You</span>
      </div>

      {blips.map((blip) => (
        <div
          key={blip.id}
          className={styles.blip}
          style={{ top: blip.top, left: blip.left }}
        >
          <span
            className={styles.blipDot}
            style={{ animationDelay: blip.delay }}
          />
          {blip.chip && (
            <div className={styles.chip}>
              <span className={styles.chipName}>{blip.chip.name}</span>
              <span className={`num ${styles.chipRating}`}>★ {blip.chip.rating}</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
