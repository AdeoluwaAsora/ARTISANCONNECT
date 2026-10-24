import { isAxiosError } from "axios";
import { apiClient } from "./client";
import { ApiError, asUtc, rethrowApiError, unwrap } from "./unwrap";
import {
  TradeValue,
  isTradeName,
  tradeLabel,
  type ApiResponse,
  type PaginatedList,
} from "@/types/api";
import type { CreateJobInput, Job, JobResult, JobStatus } from "@/types/job";

/**
 * Real Jobs API. Same function names and return types as the
 * old mock service, so pages only needed their import path changed.
 */

// The backend caps page size at 50. Lists here fetch the first page only;
// add paging to the pages when anyone has more than 50 jobs.
const PAGE_SIZE = 50;

const STATUS_FROM_API: Record<JobResult["status"], JobStatus> = {
  Open: "open",
  Assigned: "assigned",
  InProgress: "in_progress",
  Completed: "completed",
  Cancelled: "cancelled",
};

const URGENCY_NORMAL = 1;

function toJob(result: JobResult): Job {
  return {
    id: result.jobId,
    customerId: result.customerId,
    title: result.title,
    description: result.description,
    trade: tradeLabel(result.requiredTrade),
    budgetMin: result.budgetMin,
    budgetMax: result.budgetMax,
    location: result.address ?? "",
    status: STATUS_FROM_API[result.status],
    photos: [],
    postedAt: asUtc(result.createdAtUtc),
    assignedArtisanId: result.assignedArtisanId ?? undefined,
    assignedArtisanName: result.assignedArtisanName ?? undefined,
    bidCount: result.bidCount,
  };
}

export const jobsApi = {
  /** The signed-in customer's own jobs, newest first. */
  getMyJobs: async (statusFilter?: JobStatus): Promise<Job[]> => {
    try {
      const res = await apiClient.get<ApiResponse<PaginatedList<JobResult>>>("/jobs/my", {
        params: { pageNumber: 1, pageSize: PAGE_SIZE },
      });
      const jobs = unwrap(res.data).items.map(toJob);
      return statusFilter ? jobs.filter((j) => j.status === statusFilter) : jobs;
    } catch (err) {
      return rethrowApiError(err);
    }
  },

  /** Open jobs artisans can bid on, newest first. Artisan accounts only. */
  getOpenJobs: async (): Promise<Job[]> => {
    try {
      const res = await apiClient.get<ApiResponse<PaginatedList<JobResult>>>("/jobs/open", {
        params: { pageNumber: 1, pageSize: PAGE_SIZE },
      });
      return unwrap(res.data).items.map(toJob);
    } catch (err) {
      return rethrowApiError(err);
    }
  },

  /** Returns null when the job doesn't exist (404). */
  getById: async (id: string): Promise<Job | null> => {
    try {
      const res = await apiClient.get<ApiResponse<JobResult>>(`/jobs/${id}`);
      return toJob(unwrap(res.data));
    } catch (err) {
      if (isAxiosError(err) && err.response?.status === 404) return null;
      return rethrowApiError(err);
    }
  },

  create: async (input: CreateJobInput): Promise<Job> => {
    if (!isTradeName(input.trade)) {
      throw new ApiError(`Unknown trade "${input.trade}".`);
    }

    try {
      const res = await apiClient.post<ApiResponse<JobResult>>("/jobs", {
        title: input.title,
        description: input.description,
        // The API has no string-enum converter, so enums are sent as numbers.
        requiredTrade: TradeValue[input.trade],
        budgetMin: input.budgetMin,
        budgetMax: input.budgetMax,
        urgency: URGENCY_NORMAL,
        latitude: input.latitude,
        longitude: input.longitude,
        address: `${input.address}, ${input.city}`,
      });
      return toJob(unwrap(res.data));
    } catch (err) {
      return rethrowApiError(err);
    }
  },

  cancel: async (id: string): Promise<Job> => {
    try {
      const res = await apiClient.post<ApiResponse<JobResult>>(`/jobs/${id}/cancel`);
      return toJob(unwrap(res.data));
    } catch (err) {
      return rethrowApiError(err);
    }
  },

  /**
   * No backend endpoint yet: jobs only reach Assigned/InProgress once Bidding
   * and Contracts exist, so the "Mark complete" button can't appear before then.
   */
  complete: async (_id: string): Promise<Job> => {
    throw new ApiError("Marking a job as complete isn't available yet.");
  },
};
