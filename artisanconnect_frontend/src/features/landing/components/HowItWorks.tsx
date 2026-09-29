import styles from "./HowItWorks.module.css";

const steps = [
  {
    number: "01",
    title: "Describe the job",
    description:
      "Tell us what's wrong, add a photo if you can, and set a budget. Takes under a minute.",
  },
  {
    number: "02",
    title: "Compare nearby bids",
    description:
      "Verified artisans within your radius bid with a price and ETA. You see ratings and distance for each.",
  },
  {
    number: "03",
    title: "Hire and track live",
    description:
      "Accept a bid, chat in-app, and watch your artisan's live location as they head your way.",
  },
  {
    number: "04",
    title: "Pay only when it's done",
    description:
      "Funds sit in escrow until you confirm the job's complete, then release instantly.",
  },
];

export function HowItWorks() {
  return (
      <section id="how-it-works" className={styles.section}>
      <div className="container">
        <div className={styles.heading}>
          <span className="eyebrow">From problem to fixed</span>
          <h2 className="display-2">Four steps, start to finish</h2>
        </div>

        <ol className={styles.steps}>
          {steps.map((step) => (
            <li key={step.number} className={styles.step}>
              <span className={styles.number} aria-hidden="true">
                {step.number}
              </span>
              <h3 className={`heading-sm ${styles.title}`}>{step.title}</h3>
              <p className="body-base">{step.description}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
