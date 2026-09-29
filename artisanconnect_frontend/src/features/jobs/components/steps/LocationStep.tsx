import type { FieldErrors, UseFormRegister } from "react-hook-form";
import { Input } from "@/components/forms";
import type { PostJobFormValues } from "@/features/jobs/schemas";
import styles from "./steps.module.css";

interface LocationStepProps {
  register: UseFormRegister<PostJobFormValues>;
  errors: FieldErrors<PostJobFormValues>;
}

export function LocationStep({ register, errors }: LocationStepProps) {
  return (
    <div className={styles.stepFields}>
      <Input
        label="Street address"
        placeholder="e.g. 14 Admiralty Way"
        error={errors.address?.message}
        {...register("address")}
      />
      <Input
        label="City"
        placeholder="e.g. Lekki, Lagos"
        error={errors.city?.message}
        {...register("city")}
      />
      <p className="body-sm">
        Your exact address is only shared with the artisan once you accept their bid.
      </p>
    </div>
  );
}
