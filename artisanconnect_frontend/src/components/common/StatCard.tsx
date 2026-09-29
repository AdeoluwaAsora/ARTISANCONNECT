import type { ReactNode } from "react";
import { Card } from "@/components/ui";
import styles from "./StatCard.module.css";

export interface StatCardProps {
  label: string;
  value: string;
  icon: ReactNode;
  tone?: "primary" | "accent" | "secondary";
  trend?: string;
}

export function StatCard({ label, value, icon, tone = "primary", trend }: StatCardProps) {
  return (
    <Card className={styles.card}>
      <div className={`${styles.iconWrap} ${styles[tone]}`}>{icon}</div>
      <div className={styles.body}>
        <span className={`num ${styles.value}`}>{value}</span>
        <span className={styles.label}>{label}</span>
        {trend && <span className={styles.trend}>{trend}</span>}
      </div>
    </Card>
  );
}
