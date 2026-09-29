import type { FieldErrors, UseFormRegister } from "react-hook-form";
import { Input } from "@/components/forms";
import type { PostJobFormValues } from "@/features/jobs/schemas";
import styles from "./steps.module.css";

interface BudgetStepProps {
  register: UseFormRegister<PostJobFormValues>;
  errors: FieldErrors<PostJobFormValues>;
}

export function BudgetStep({ register, errors }: BudgetStepProps) {
  return (
    <div className={styles.stepFields}>
      <div className={styles.row}>
        <Input
          label="Minimum budget (₦)"
          type="number"
          min={0}
          error={errors.budgetMin?.message}
          {...register("budgetMin", { valueAsNumber: true })}
        />
        <Input
          label="Maximum budget (₦)"
          type="number"
          min={0}
          error={errors.budgetMax?.message}
          {...register("budgetMax", { valueAsNumber: true })}
        />
      </div>
      <p className="body-sm">
        Artisans will bid within or near this range — setting a realistic budget gets
        you faster, better-matched bids.
      </p>
    </div>
  );
}
