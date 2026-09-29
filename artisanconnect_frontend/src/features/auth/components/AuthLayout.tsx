import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { PulseDot } from "@/components/ui";
import styles from "./AuthLayout.module.css";

interface AuthLayoutProps {
  eyebrow: string;
  title: string;
  subtitle: string;
  children: ReactNode;
}

/**
 * Split-screen shell shared by Login, Register (customer/artisan),
 * Forgot Password and Reset Password. Left panel carries brand + trust
 * signal, right panel hosts the actual form.
 */
export function AuthLayout({ eyebrow, title, subtitle, children }: AuthLayoutProps) {
  return (
    <div className={styles.page}>
      <div className={styles.brandPanel}>
        <Link to="/" className={styles.brand}>
          <img src="/favicon.ico" alt="ArtisanConnect" className={styles.brandMark} />
          <span className={styles.brandName}>
            Artisan<span className={styles.brandAccent}>Connect</span>
          </span>
        </Link>

        <div className={styles.brandCopy}>
          <h2 className={`heading-lg ${styles.brandHeadline}`}>
            Verified pros, tracked in real time, paid securely.
          </h2>
          <p className={`body-base ${styles.brandSubtext}`}>
            Every artisan on ArtisanConnect is identity-verified before their first
            job. Every payment sits in escrow until you confirm the work's done.
          </p>
        </div>

        <div className={styles.brandStat}>
          <PulseDot tone="accent" />
          <span className="body-sm">12,400+ artisans verified and active</span>
        </div>
      </div>

      <div className={styles.formPanel}>
        <div className={styles.formInner}>
          <span className="eyebrow">{eyebrow}</span>
          <h1 className={`display-2 ${styles.title}`}>{title}</h1>
          <p className={`body-base ${styles.subtitle}`}>{subtitle}</p>
          {children}
        </div>
      </div>
    </div>
  );
}
