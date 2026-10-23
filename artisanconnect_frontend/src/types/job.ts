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
  /** Backend trade name, e.g. "AcTechnician". */
  trade: string;
  address: string;
  city: string;
  latitude: number;
  longitude: number;
  budgetMin: number;
  budgetMax: number;
  /** Local previews only for now; not uploaded until file storage exists. */
  photos: JobPhoto[];
}

/** Matches the backend's JobResult schema exactly (enums arrive as names). */
export interface JobResult {
  jobId: string;
  customerId: string;
  title: string;
  description: string;
  requiredTrade: string;
  budgetMin: number;
  budgetMax: number;
  urgency: "Normal" | "Urgent";
  status: "Open" | "Assigned" | "InProgress" | "Completed" | "Cancelled";
  latitude: number;
  longitude: number;
  address: string | null;
  assignedArtisanId: string | null;
  assignedArtisanName: string | null;
  /** Live bids (excludes withdrawn). */
  bidCount: number;
  createdAtUtc: string;
}
