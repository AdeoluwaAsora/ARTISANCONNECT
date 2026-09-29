export type BidStatus = "pending" | "accepted" | "rejected" | "withdrawn";

export interface Bid {
  id: string;
  jobId: string;
  artisanId: string;
  artisanName: string;
  artisanRating: number;
  artisanDistanceKm: number;
  artisanInitials: string;
  amount: number;
  etaMinutes: number;
  message: string;
  status: BidStatus;
  submittedAt: string;
}
