import type { FieldErrors, UseFormRegister } from "react-hook-form";
import { Input, Select, Textarea } from "@/components/forms";
import type { PostJobFormValues } from "@/features/jobs/schemas";
import styles from "./steps.module.css";

const tradeOptions = [
  { value: "Electrician", label: "Electrician" },
  { value: "Plumber", label: "Plumber" },
  { value: "Carpenter", label: "Carpenter" },
  { value: "Mechanic", label: "Mechanic" },
  { value: "Painter", label: "Painter" },
  { value: "AC Technician", label: "AC Technician" },
  { value: "Solar Installer", label: "Solar Installer" },
];

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
