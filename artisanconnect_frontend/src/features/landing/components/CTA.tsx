import { Link } from "react-router-dom";
import { Button } from "@/components/ui";
import styles from "./CTA.module.css";

export function CTA() {
  return (
    <section className={styles.section}>
      <div className={`container ${styles.grid}`}>
        <div className={styles.panel}>
          <h3 className="heading-lg">Need something fixed?</h3>
          <p className="body-base">
            Post a job free and see verified bids from nearby artisans in minutes.
          </p>
          <Link to="/post-job">
            <Button size="lg">Post a job</Button>
          </Link>
        </div>

        <div className={`${styles.panel} ${styles.panelDark}`}>
          <h3 className={`heading-lg ${styles.panelDarkTitle}`}>Are you an artisan?</h3>
          <p className={`body-base ${styles.panelDarkText}`}>
            Get verified, set your radius, and start receiving job requests today.
          </p>
          <Link to="/join-as-artisan">
            <Button size="lg" variant="secondary">
              Join as an artisan
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
