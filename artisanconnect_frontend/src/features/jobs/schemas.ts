import { z } from "zod";

export const postJobSchema = z
  .object({
    title: z.string().min(6, "Give your job a short, clear title"),
    trade: z.string().min(1, "Select the trade this job needs"),
    description: z.string().min(20, "Add a bit more detail (at least 20 characters)"),
    address: z.string().min(4, "Enter the job address"),
    city: z.string().min(2, "Enter a city"),
    budgetMin: z.number({ invalid_type_error: "Enter a minimum budget" }).min(500, "Minimum budget is too low"),
    budgetMax: z.number({ invalid_type_error: "Enter a maximum budget" }),
    photos: z.array(z.object({ id: z.string(), url: z.string() })),
  })
  .refine((data) => data.budgetMax >= data.budgetMin, {
    message: "Maximum budget must be at least the minimum",
    path: ["budgetMax"],
  });

export type PostJobFormValues = z.infer<typeof postJobSchema>;

export const postJobStepFields: Record<number, (keyof PostJobFormValues)[]> = {
  0: ["title", "trade", "description"],
  1: ["address", "city"],
  2: ["budgetMin", "budgetMax"],
  3: ["photos"],
};

export const postJobSteps = ["Job details", "Location", "Budget", "Photos", "Review"];
