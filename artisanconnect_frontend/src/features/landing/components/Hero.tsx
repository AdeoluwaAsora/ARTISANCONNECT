import { useState } from "react";
import { FiSearch, FiMapPin } from "react-icons/fi";
import { Button, PulseDot } from "@/components/ui";
import { RadarIllustration } from "./RadarIllustration";
import styles from "./Hero.module.css";

const trustStats = [
  { value: "12,400+", label: "Verified artisans" },
  { value: "4.8 / 5", label: "Average job rating" },
  { value: "< 9 min", label: "Median response time" },
];

export function Hero() {
  const [query, setQuery] = useState("");

  return (
    <section className={styles.hero}>
      <div className={`container ${styles.grid}`}>
        <div className={styles.copy}>
          <span className="eyebrow">Nearby, verified, ready now</span>
          <h1 className={`display-1 ${styles.headline}`}>
            Find yourself a trusted artisan.
          </h1>
          <p className={`body-lg ${styles.subhead}`}>
            ArtisanConnect shows you real electricians, plumbers, and tradespeople that 
            live near you; verified, rated, and trackable from first message to
            finished job.
          </p>

          <form
            className={styles.searchBar}
            role="search"
            onSubmit={(e) => e.preventDefault()}
          >
            <label htmlFor="hero-search" className="visually-hidden">
              What do you need done?
            </label>
            <FiSearch className={styles.searchIcon} aria-hidden="true" />
            <input
              id="hero-search"
              type="text"
              placeholder="What do you need done? e.g. Leaking kitchen tap"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className={styles.searchInput}
            />
            <div className={styles.searchDivider} aria-hidden="true" />
            <FiMapPin className={styles.searchIcon} aria-hidden="true" />
            <input
              type="text"
              placeholder="Your location"
              className={styles.searchInputSmall}
              aria-label="Your location"
            />
            <Button type="submit" size="md" className={styles.searchSubmit}>
              Search
            </Button>
          </form>

          <div className={styles.trustRow}>
            {trustStats.map((stat) => (
              <div key={stat.label} className={styles.trustStat}>
                <span className={`num ${styles.trustValue}`}>{stat.value}</span>
                <span className={styles.trustLabel}>{stat.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.visual}>
          <RadarIllustration />
          <div className={styles.visualCaption}>
            <PulseDot tone="accent" size="sm" />
            <span className="body-sm">6 artisans online within 2 km of you</span>
          </div>
        </div>
      </div>
    </section>
  );
}
