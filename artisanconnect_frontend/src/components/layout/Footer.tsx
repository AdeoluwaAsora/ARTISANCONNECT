import { Link } from "react-router-dom";
import { FiSmartphone } from "react-icons/fi";
import { FaApple, FaGooglePlay } from "react-icons/fa";
import styles from "./Footer.module.css";

const columns = [
  {
    title: "Customers",
    links: [
      { label: "Find an artisan", to: "/find-artisans" },
      { label: "Post a job", to: "/post-job" },
      { label: "How it works", to: "/how-it-works" },
      { label: "Trust & safety", to: "/trust-safety" },
    ],
  },
  {
    title: "Artisans",
    links: [
      { label: "Join as an artisan", to: "/join-as-artisan" },
      { label: "Get verified", to: "/verification" },
      { label: "Pricing & fees", to: "/pricing" },
      { label: "Success stories", to: "/stories" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About us", to: "/about" },
      { label: "Careers", to: "/careers" },
      { label: "Press", to: "/press" },
      { label: "Contact", to: "/contact" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Terms of service", to: "/terms" },
      { label: "Privacy policy", to: "/privacy" },
      { label: "Dispute resolution", to: "/disputes" },
    ],
  },
];

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.top}`}>
        <div className={styles.brandColumn}>
          <div className={styles.brandRow}>
            <img src="/favicon.ico" alt="ArtisanConnect" className={styles.brandMark} />
            <span className={styles.brandName}>ArtisanConnect</span>
          </div>
          <p className={`body-sm ${styles.tagline}`}>
            Trusted, verified artisans — found by proximity, hired with confidence.
          </p>

          <div className={styles.appBadges}>
            <a className={styles.appBadge} href="#download-ios">
              <FaApple size={18} aria-hidden="true" />
              <span>
                <span className={styles.appBadgeSmall}>Download on the</span>
                <span className={styles.appBadgeBig}>App Store</span>
              </span>
            </a>
            <a className={styles.appBadge} href="#download-android">
              <FaGooglePlay size={16} aria-hidden="true" />
              <span>
                <span className={styles.appBadgeSmall}>Get it on</span>
                <span className={styles.appBadgeBig}>Google Play</span>
              </span>
            </a>
          </div>
        </div>

        <div className={styles.linkGrid}>
          {columns.map((col) => (
            <div key={col.title} className={styles.linkColumn}>
              <h3 className={styles.colTitle}>{col.title}</h3>
              <ul className={styles.colList}>
                {col.links.map((link) => (
                  <li key={link.to}>
                    <Link to={link.to} className={styles.colLink}>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className={`container ${styles.bottom}`}>
        <p className="body-sm">
          © {new Date().getFullYear()} ArtisanConnect. All rights reserved.
        </p>
        <div className={styles.bottomMeta}>
          <FiSmartphone aria-hidden="true" />
          <span className="body-sm">Available on Android &amp; iOS</span>
        </div>
      </div>
    </footer>
  );
}
