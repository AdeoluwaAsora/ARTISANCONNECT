import type { IconType } from "react-icons";
import {
    GiElectric,
    GiWaterDrop,
    GiHammerNails,
    GiCarWheel,
    GiPaintRoller,
    GiSewingNeedle,
    GiSnowflake1,
    GiSolarPower,
} from "react-icons/gi";
import { Card } from "@/components/ui";
import styles from "./Categories.module.css";
import { FaHome } from "react-icons/fa";
import { Link } from "react-router-dom";

interface Category {
    label: string;
    icon: IconType;
    count: string;
}

const categories: Category[] = [
    { label: "Electricians", icon: GiElectric, count: "2,180 nearby" },
    { label: "Plumbers", icon: GiWaterDrop, count: "1,940 nearby" },
    { label: "Carpenters", icon: GiHammerNails, count: "1,510 nearby" },
    { label: "Mechanics", icon: GiCarWheel, count: "1,260 nearby" },
    { label: "Painters", icon: GiPaintRoller, count: "980 nearby" },
    { label: "Tailors", icon: GiSewingNeedle, count: "870 nearby" },
    { label: "AC technicians", icon: GiSnowflake1, count: "760 nearby" },
    { label: "Solar installers", icon: GiSolarPower, count: "410 nearby" },
    { label: "Housing agents", icon: FaHome, count: "540 nearby" },
];

export function Categories() {
    return (
        <section id="categories" className={styles.section}>
            <div className="container">
                <div className={styles.heading}>
                    <span className="eyebrow">Browse by trade</span>
                    <h2 className="display-2">Whatever the job, there's a verified pro for it</h2>
                </div>

                <div className={styles.grid}>
                    {categories.map(({ label, icon: Icon, count }) => (
                        <Link key={label} to="/login" className={styles.cardLink}>
                            <Card interactive padding="lg" className={styles.card}>
                                <span className={styles.iconWrap}>
                                    <Icon size={26} aria-hidden="true" />
                                </span>
                                <span className={`heading-sm ${styles.label}`}>{label}</span>
                                <span className={`body-sm ${styles.count}`}>{count}</span>
                            </Card>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}