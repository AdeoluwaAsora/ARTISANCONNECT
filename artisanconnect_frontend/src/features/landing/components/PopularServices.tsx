import { FiArrowUpRight } from "react-icons/fi";
import { Card } from "@/components/ui";
import styles from "./PopularServices.module.css";

interface Service {
  title: string;
  trade: string;
  priceRange: string;
  turnaround: string;
}

const services: Service[] = [
  {
    title: "Fix a leaking tap or pipe",
    trade: "Plumbing",
    priceRange: "₦8,000 – ₦18,000",
    turnaround: "Same day",
  },
  {
    title: "Install ceiling fan or light fixture",
    trade: "Electrical",
    priceRange: "₦6,000 – ₦15,000",
    turnaround: "Same day",
  },
  {
    title: "Full interior wall repaint",
    trade: "Painting",
    priceRange: "₦45,000 – ₦120,000",
    turnaround: "2–4 days",
  },
  {
    title: "AC servicing and gas refill",
    trade: "AC & Cooling",
    priceRange: "₦12,000 – ₦25,000",
    turnaround: "Same day",
  },
  {
    title: "Custom wardrobe or shelving",
    trade: "Carpentry",
    priceRange: "₦60,000 – ₦200,000",
    turnaround: "5–10 days",
  },
  {
    title: "Car won't start / battery check",
    trade: "Mechanic",
    priceRange: "₦5,000 – ₦20,000",
    turnaround: "Within 2 hours",
  },
];

export function PopularServices() {
  return (
    <section className={styles.section}>
      <div className="container">
        <div className={styles.heading}>
          <span className="eyebrow">Popular requests this week</span>
          <h2 className="display-2">Common jobs, priced honestly upfront</h2>
        </div>

        <div className={styles.grid}>
          {services.map((service) => (
            <Card key={service.title} interactive className={styles.card}>
              <div className={styles.cardTop}>
                <span className="body-sm">{service.trade}</span>
                <FiArrowUpRight className={styles.arrow} aria-hidden="true" />
              </div>
              <h3 className={`heading-sm ${styles.title}`}>{service.title}</h3>
              <div className={styles.meta}>
                <span className={`num ${styles.price}`}>{service.priceRange}</span>
                <span className={styles.turnaround}>{service.turnaround}</span>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
