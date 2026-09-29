import type { PostJobFormValues } from "@/features/jobs/schemas";
import styles from "./ReviewStep.module.css";
import stepStyles from "./steps.module.css";

interface ReviewStepProps {
  values: PostJobFormValues;
}

export function ReviewStep({ values }: ReviewStepProps) {
  return (
    <div className={stepStyles.stepFields}>
      <p className="body-sm">Review everything before posting — you can edit any step.</p>

      <dl className={styles.summary}>
        <div className={styles.row}>
          <dt className="body-sm">Title</dt>
          <dd className={styles.value}>{values.title || "—"}</dd>
        </div>
        <div className={styles.row}>
          <dt className="body-sm">Trade</dt>
          <dd className={styles.value}>{values.trade || "—"}</dd>
        </div>
        <div className={styles.row}>
          <dt className="body-sm">Description</dt>
          <dd className={styles.value}>{values.description || "—"}</dd>
        </div>
        <div className={styles.row}>
          <dt className="body-sm">Location</dt>
          <dd className={styles.value}>
            {values.address ? `${values.address}, ${values.city}` : "—"}
          </dd>
        </div>
        <div className={styles.row}>
          <dt className="body-sm">Budget</dt>
          <dd className={styles.value}>
            {values.budgetMin && values.budgetMax
              ? `₦${values.budgetMin.toLocaleString()} – ₦${values.budgetMax.toLocaleString()}`
              : "—"}
          </dd>
        </div>
        <div className={styles.row}>
          <dt className="body-sm">Photos</dt>
          <dd className={styles.value}>{values.photos.length} attached</dd>
        </div>
      </dl>
    </div>
  );
}
