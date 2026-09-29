import styles from "./Stats.module.css";

const stats = [
  { value: "38,000+", label: "Jobs completed" },
  { value: "12,400+", label: "Verified artisans" },
  { value: "24", label: "Cities covered" },
  { value: "₦2.1B+", label: "Paid out to artisans" },
];

export function Stats() {
  return (
    <section className={styles.section}>
      <div className={`container ${styles.grid}`}>
        {stats.map((stat) => (
          <div key={stat.label} className={styles.stat}>
            <span className={`num ${styles.value}`}>{stat.value}</span>
            <span className={styles.label}>{stat.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
