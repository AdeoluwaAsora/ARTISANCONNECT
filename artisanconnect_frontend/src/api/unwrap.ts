import { isAxiosError } from "axios";
import type { ApiResponse } from "@/types/api";

/** Error thrown by API modules, carrying the backend's message and HTTP status. */
export class ApiError extends Error {
  readonly status?: number;
  readonly errors: string[];

  constructor(message: string, status?: number, errors: string[] = []) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.errors = errors;
  }
}

/** Returns `.data` from a successful ApiResponse, or throws an ApiError. */
export function unwrap<T>(response: ApiResponse<T>): T {
  if (!response.success) {
    throw new ApiError(
      response.message ?? response.errors?.[0] ?? "Something went wrong.",
      undefined,
      response.errors ?? [],
    );
  }
  return response.data;
}

/**
 * Converts an Axios failure into an ApiError using the backend's ApiResponse
 * envelope when there is one. Always throws.
 */
export function rethrowApiError(err: unknown): never {
  if (isAxiosError<ApiResponse<unknown>>(err)) {
    const body = err.response?.data;
    throw new ApiError(
      body?.message ?? body?.errors?.[0] ?? err.message,
      err.response?.status,
      body?.errors ?? [],
    );
  }
  throw err;
}

/** ASP.NET can serialise DateTimes without a zone marker; they are UTC. */
export function asUtc(timestamp: string): string {
  return /([zZ]|[+-]\d{2}:\d{2})$/.test(timestamp) ? timestamp : `${timestamp}Z`;
}
