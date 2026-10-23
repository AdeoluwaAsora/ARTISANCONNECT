export type BidStatus = "pending" | "accepted" | "rejected" | "withdrawn";

export interface Bid {
  id: string;
  jobId: string;
  jobTitle: string;
  artisanId: string;
  artisanName: string;
  /** Null until Reviews & Ratings exists. */
  artisanRating: number | null;
  /** Null until artisans have a location (Find Nearby Artisans). */
  artisanDistanceKm: number | null;
  artisanInitials: string;
  amount: number;
  etaMinutes: number;
  message: string;
  status: BidStatus;
  submittedAt: string;
}

export interface BidInput {
  amount: number;
  etaMinutes: number;
  message: string;
}

/** Matches the backend's BidResult schema exactly (enums arrive as names). */
export interface BidResult {
  bidId: string;
  jobId: string;
  jobTitle: string;
  artisanId: string;
  artisanName: string;
  amount: number;
  etaMinutes: number;
  message: string;
  status: "Pending" | "Accepted" | "Rejected" | "Withdrawn";
  createdAtUtc: string;
  updatedAtUtc: string | null;
}
