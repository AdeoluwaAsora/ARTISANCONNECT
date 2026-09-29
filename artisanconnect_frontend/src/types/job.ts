export type JobStatus =
  | "draft"
  | "open"
  | "assigned"
  | "in_progress"
  | "completed"
  | "cancelled";

export interface JobPhoto {
  id: string;
  url: string;
}

export interface Job {
  id: string;
  title: string;
  description: string;
  trade: string;
  budgetMin: number;
  budgetMax: number;
  location: string;
  status: JobStatus;
  photos: JobPhoto[];
  postedAt: string;
  assignedArtisanId?: string;
  assignedArtisanName?: string;
  bidCount: number;
}

export interface CreateJobInput {
  title: string;
  description: string;
  trade: string;
  address: string;
  city: string;
  budgetMin: number;
  budgetMax: number;
  photos: JobPhoto[];
}
