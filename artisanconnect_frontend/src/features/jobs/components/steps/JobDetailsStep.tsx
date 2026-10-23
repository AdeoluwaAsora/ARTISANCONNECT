import type { FieldErrors, UseFormRegister } from "react-hook-form";
import { Input, Select, Textarea } from "@/components/forms";
import type { PostJobFormValues } from "@/features/jobs/schemas";
import { TRADE_LABELS, type TradeName } from "@/types/api";
import styles from "./steps.module.css";

// Option values are backend trade names (e.g. "AcTechnician"); jobsApi.create
// converts them to the enum number the API expects.
const tradeOptions = (Object.keys(TRADE_LABELS) as TradeName[]).map((name) => ({
  value: name,
  label: TRADE_LABELS[name],
}));

interface JobDetailsStepProps {
  register: UseFormRegister<PostJobFormValues>;
  errors: FieldErrors<PostJobFormValues>;
}

export function JobDetailsStep({ register, errors }: JobDetailsStepProps) {
  return (
    <div className={styles.stepFields}>
      <Input
        label="Job title"
        placeholder="e.g. Fix leaking kitchen tap"
        error={errors.title?.message}
        {...register("title")}
      />
      <Select
        label="Trade needed"
        placeholder="Select a trade"
        options={tradeOptions}
        error={errors.trade?.message}
        {...register("trade")}
      />
      <Textarea
        label="Description"
        placeholder="Describe the problem in a bit of detail — what's wrong, when it started, anything the artisan should know before arriving."
        error={errors.description?.message}
        {...register("description")}
      />
    </div>
  );
}
