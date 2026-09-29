import { FaApple, FaGooglePlay } from "react-icons/fa";
import { PulseDot } from "@/components/ui";
import styles from "./DownloadApp.module.css";

export function DownloadApp() {
  return (
    <section className={styles.section}>
      <div className={`container ${styles.inner}`}>
        <div className={styles.copy}>
          <span className="eyebrow">Take it with you</span>
          <h2 className="display-2">Track your artisan's arrival from your pocket</h2>
          <p className="body-lg">
            Get push notifications the moment a bid comes in, chat on the go, and
            watch live location updates without opening a browser.
          </p>

          <div className={styles.badgeRow}>
            <a className={styles.badge} href="#download-ios">
              <FaApple size={22} aria-hidden="true" />
              <span>
                <span className={styles.badgeSmall}>Download on the</span>
                <span className={styles.badgeBig}>App Store</span>
              </span>
            </a>
            <a className={styles.badge} href="#download-android">
              <FaGooglePlay size={20} aria-hidden="true" />
              <span>
                <span className={styles.badgeSmall}>Get it on</span>
                <span className={styles.badgeBig}>Google Play</span>
              </span>
            </a>
          </div>
        </div>

        <div className={styles.phoneMock} aria-hidden="true">
          <div className={styles.phoneNotch} />
          <div className={styles.phoneCard}>
            <div className={styles.phoneRow}>
              <PulseDot tone="accent" />
              <span className="body-sm">Amaka is 6 minutes away</span>
            </div>
            <div className={styles.phoneBar} />
            <div className={styles.phoneBarShort} />
          </div>
        </div>
      </div>
    </section>
  );
}
