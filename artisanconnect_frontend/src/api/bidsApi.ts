import { apiClient } from "./client";
import { asUtc, rethrowApiError, unwrap } from "./unwrap";
import type { ApiResponse, PaginatedList } from "@/types/api";
import type { Bid, BidInput, BidResult, BidStatus } from "@/types/bid";

/**
 * Real Bids API (replaced the old mock service). The signed-in user's identity
 * comes from their token, so unlike the mock nothing takes an artisanId.
 */

// The backend caps page size at 50; lists fetch the first page only.
const PAGE_SIZE = 50;

const STATUS_FROM_API: Record<BidResult["status"], BidStatus> = {
  Pending: "pending",
  Accepted: "accepted",
  Rejected: "rejected",
  Withdrawn: "withdrawn",
};

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return parts.length === 0
    ? "?"
    : parts
        .slice(0, 2)
        .map((p) => p[0]!.toUpperCase())
        .join("");
}

function toBid(result: BidResult): Bid {
  return {
    id: result.bidId,
    jobId: result.jobId,
    jobTitle: result.jobTitle,
    artisanId: result.artisanId,
    artisanName: result.artisanName,
    artisanRating: null,
    artisanDistanceKm: null,
    artisanInitials: initialsOf(result.artisanName),
    amount: result.amount,
    etaMinutes: result.etaMinutes,
    message: result.message,
    status: STATUS_FROM_API[result.status],
    submittedAt: asUtc(result.createdAtUtc),
  };
}

async function bidAction(url: string): Promise<Bid> {
  try {
    const res = await apiClient.post<ApiResponse<BidResult>>(url);
    return toBid(unwrap(res.data));
  } catch (err) {
    return rethrowApiError(err);
  }
}

export const bidsApi = {
  /**
   * Bids on a job. A customer gets every live bid on their own job; an
   * artisan gets only their own bid(s) on it.
   */
  getForJob: async (jobId: string): Promise<Bid[]> => {
    try {
      const res = await apiClient.get<ApiResponse<PaginatedList<BidResult>>>(`/jobs/${jobId}/bids`, {
        params: { pageNumber: 1, pageSize: PAGE_SIZE },
      });
      return unwrap(res.data).items.map(toBid);
    } catch (err) {
      return rethrowApiError(err);
    }
  },

  /** The signed-in artisan's bids across all jobs, newest first. */
  getMine: async (): Promise<Bid[]> => {
    try {
      const res = await apiClient.get<ApiResponse<PaginatedList<BidResult>>>("/bids/my", {
        params: { pageNumber: 1, pageSize: PAGE_SIZE },
      });
      return unwrap(res.data).items.map(toBid);
    } catch (err) {
      return rethrowApiError(err);
    }
  },

  submit: async (jobId: string, input: BidInput): Promise<Bid> => {
    try {
      const res = await apiClient.post<ApiResponse<BidResult>>(`/jobs/${jobId}/bids`, input);
      return toBid(unwrap(res.data));
    } catch (err) {
      return rethrowApiError(err);
    }
  },

  update: async (bidId: string, input: BidInput): Promise<Bid> => {
    try {
      const res = await apiClient.put<ApiResponse<BidResult>>(`/bids/${bidId}`, input);
      return toBid(unwrap(res.data));
    } catch (err) {
      return rethrowApiError(err);
    }
  },

  withdraw: (bidId: string) => bidAction(`/bids/${bidId}/withdraw`),

  /** Also assigns the job and rejects every other pending bid on it. */
  accept: (bidId: string) => bidAction(`/bids/${bidId}/accept`),

  reject: (bidId: string) => bidAction(`/bids/${bidId}/reject`),
};
