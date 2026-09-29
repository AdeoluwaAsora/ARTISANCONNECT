import styles from "./StepIndicator.module.css";

export interface StepIndicatorProps {
  steps: string[];
  currentStep: number;
}

export function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  return (
    <ol className={styles.list}>
      {steps.map((step, index) => {
        const state =
          index < currentStep ? "done" : index === currentStep ? "current" : "upcoming";
        return (
          <li key={step} className={styles.item}>
            <span className={`${styles.circle} ${styles[state]}`}>
              {state === "done" ? "✓" : index + 1}
            </span>
            <span className={`${styles.label} ${state === "current" ? styles.labelActive : ""}`}>
              {step}
            </span>
            {index < steps.length - 1 && <span className={styles.connector} aria-hidden="true" />}
          </li>
        );
      })}
    </ol>
  );
}
