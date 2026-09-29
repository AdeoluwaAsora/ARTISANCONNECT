import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input, Textarea } from "@/components/forms";
import { Button, Card } from "@/components/ui";
import { bidsApi } from "@/services/mockBids";
import styles from "./SubmitBidForm.module.css";

const submitBidSchema = z.object({
  amount: z.number({ invalid_type_error: "Enter your quote" }).min(500, "Amount is too low"),
  etaMinutes: z
    .number({ invalid_type_error: "Enter your ETA in minutes" })
    .min(5, "Enter a realistic ETA"),
  message: z.string().min(10, "Add a short note (at least 10 characters)"),
});

type SubmitBidFormValues = z.infer<typeof submitBidSchema>;

interface SubmitBidFormProps {
  jobId: string;
  artisanId: string;
  onSubmitted: () => void;
}

export function SubmitBidForm({ jobId, artisanId, onSubmitted }: SubmitBidFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SubmitBidFormValues>({
    resolver: zodResolver(submitBidSchema),
    defaultValues: { amount: 0, etaMinutes: 30, message: "" },
  });

  const onSubmit = async (values: SubmitBidFormValues) => {
    setIsSubmitting(true);
    try {
      await bidsApi.submit({ jobId, artisanId, ...values });
      onSubmitted();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <form className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className={styles.row}>
          <Input
            label="Your quote (₦)"
            type="number"
            min={0}
            error={errors.amount?.message}
            {...register("amount", { valueAsNumber: true })}
          />
          <Input
            label="ETA (minutes)"
            type="number"
            min={5}
            error={errors.etaMinutes?.message}
            {...register("etaMinutes", { valueAsNumber: true })}
          />
        </div>
        <Textarea
          label="Message to customer"
          placeholder="e.g. I can come by this afternoon, I have the part in stock already."
          error={errors.message?.message}
          {...register("message")}
        />
        <Button type="submit" isLoading={isSubmitting} fullWidth>
          Submit bid
        </Button>
      </form>
    </Card>
  );
}
