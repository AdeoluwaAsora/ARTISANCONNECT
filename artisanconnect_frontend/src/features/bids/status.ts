import type { BidStatus } from "@/types/bid";

/** Badge tone for each bid status, shared by every page that lists bids. */
export const bidStatusTone: Record<BidStatus, "neutral" | "success" | "danger" | "warning"> = {
  pending: "warning",
  accepted: "success",
  rejected: "danger",
  withdrawn: "neutral",
};
