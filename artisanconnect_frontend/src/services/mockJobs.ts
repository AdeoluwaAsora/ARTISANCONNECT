import type { CreateJobInput, Job, JobStatus } from "@/types/job";
import { delay } from "./delay";

let jobs: Job[] = [
  {
    id: "job-1",
    title: "Fix leaking kitchen tap",
    description:
      "The cold water tap in the kitchen has been dripping constantly for two days. Might need a new washer or the whole tap replaced.",
    trade: "Plumber",
    budgetMin: 8000,
    budgetMax: 18000,
    location: "Lekki Phase 1, Lagos",
    status: "open",
    photos: [],
    postedAt: "2026-07-01T09:15:00Z",
    bidCount: 3,
  },
  {
    id: "job-2",
    title: "Install 3 ceiling fans",
    description: "Need three ceiling fans installed in bedrooms. Wiring is already in place, just need mounting and connection.",
    trade: "Electrician",
    budgetMin: 12000,
    budgetMax: 20000,
    location: "Ikeja GRA, Lagos",
    status: "assigned",
    photos: [],
    postedAt: "2026-06-28T14:00:00Z",
    assignedArtisanId: "artisan-1",
    assignedArtisanName: "Chidi Okafor",
    bidCount: 6,
  },
  {
    id: "job-3",
    title: "AC servicing and gas refill",
    description: "Split unit AC blowing warm air, likely needs a gas refill and general service.",
    trade: "AC Technician",
    budgetMin: 12000,
    budgetMax: 25000,
    location: "Yaba, Lagos",
    status: "completed",
    photos: [],
    postedAt: "2026-06-10T11:30:00Z",
    assignedArtisanId: "artisan-4",
    assignedArtisanName: "Ngozi Eze",
    bidCount: 4,
  },
];

export const jobsApi = {
  getMyJobs: (statusFilter?: JobStatus) => {
    const results = statusFilter ? jobs.filter((j) => j.status === statusFilter) : jobs;
    return delay(results, 400);
  },

  getOpenJobs: () => delay(jobs.filter((j) => j.status === "open"), 400),

  getById: (id: string) => delay(jobs.find((j) => j.id === id) ?? null, 300),

  create: (input: CreateJobInput) => {
    const newJob: Job = {
      id: `job-${jobs.length + 1}`,
      title: input.title,
      description: input.description,
      trade: input.trade,
      budgetMin: input.budgetMin,
      budgetMax: input.budgetMax,
      location: `${input.address}, ${input.city}`,
      status: "open",
      photos: input.photos,
      postedAt: new Date().toISOString(),
      bidCount: 0,
    };
    jobs = [newJob, ...jobs];
    return delay(newJob, 500);
  },

  cancel: (id: string) => {
    jobs = jobs.map((j) => (j.id === id ? { ...j, status: "cancelled" } : j));
    return delay(jobs.find((j) => j.id === id) ?? null, 300);
  },

  complete: (id: string) => {
    jobs = jobs.map((j) => (j.id === id ? { ...j, status: "completed" } : j));
    return delay(jobs.find((j) => j.id === id) ?? null, 300);
  },
};
