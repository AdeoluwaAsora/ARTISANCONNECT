import { Card } from "@/components/ui";
import styles from "./Testimonials.module.css";

interface Testimonial {
  quote: string;
  name: string;
  context: string;
}

const testimonials: Testimonial[] = [
  {
    quote:
      "Our pipe burst at 11pm. I posted the job and had a plumber's ETA in four minutes flat.",
    name: "Funke A.",
    context: "Homeowner, Lekki",
  },
  {
    quote:
      "I could see him on the map the whole way. No more wondering if someone's actually coming.",
    name: "David K.",
    context: "Customer, Ikeja",
  },
  {
    quote:
      "Getting verified took a day, and since then my bookings have basically tripled.",
    name: "Chidi O.",
    context: "Electrician, 4.9★",
  },
];

export function Testimonials() {
  return (
    <section className={styles.section}>
      <div className="container">
        <div className={styles.heading}>
          <span className="eyebrow">From the neighborhood</span>
          <h2 className="display-2">People trust what they can see</h2>
        </div>

        <div className={styles.grid}>
          {testimonials.map((t) => (
            <Card key={t.name} className={styles.card}>
              <p className={`body-lg ${styles.quote}`}>&ldquo;{t.quote}&rdquo;</p>
              <div className={styles.attribution}>
                <span className="heading-sm">{t.name}</span>
                <span className="body-sm">{t.context}</span>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
