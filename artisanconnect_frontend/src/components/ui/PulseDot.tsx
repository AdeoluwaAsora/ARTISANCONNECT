import styles from "./PulseDot.module.css";

export type PulseTone = "accent" | "secondary" | "slate";

export interface PulseDotProps {
  tone?: PulseTone;
  label?: string;
  animated?: boolean;
  size?: "sm" | "md";
}

/**
 * The brand's signature motif: a small pulsing dot representing a live,
 * nearby, available artisan. Reused for online-status markers, map pins,
 * and the hero radar illustration so the "real-time proximity" idea
 * recurs consistently across the product.
 */
export function PulseDot({
  tone = "accent",
  label,
  animated = true,
  size = "md",
}: PulseDotProps) {
  return (
    <span className={styles.wrapper}>
      <span
        className={[
          styles.dot,
          styles[tone],
          styles[size],
          animated ? styles.animated : "",
        ].join(" ")}
        aria-hidden="true"
      >
        {animated && <span className={styles.ring} />}
      </span>
      {label && <span className={styles.label}>{label}</span>}
    </span>
  );
}
