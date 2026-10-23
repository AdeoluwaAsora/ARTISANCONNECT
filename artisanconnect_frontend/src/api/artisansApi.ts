import { isAxiosError } from "axios";
import { apiClient } from "./client";
import { initialsOf } from "@/lib/initials";
import { rethrowApiError, unwrap } from "./unwrap";
import { tradeLabel, type ApiResponse, type PaginatedList } from "@/types/api";
import type {
  ArtisanProfile,
  ArtisanSummaryResult,
  MyProfileResult,
  NearbySearchFilters,
  SearchOrigin,
  UpdateMyArtisanProfileInput,
} from "@/types/artisan";

/** Real Artisans API (replaced the old mock service). */

// The backend caps page size at 50; the search fetches the first page only.
const PAGE_SIZE = 50;


function toArtisan(result: ArtisanSummaryResult): ArtisanProfile {
  return {
    id: result.artisanId,
    name: result.name,
    initials: initialsOf(result.name),
    trade: tradeLabel(result.trade),
    bio: result.bio ?? "",
    rating: null,
    reviewCount: null,
    jobsCompleted: result.jobsCompleted,
    yearsExperience: result.yearsOfExperience,
    hourlyRate: result.hourlyRate,
    distanceKm: result.distanceKm === null ? null : Math.round(result.distanceKm * 10) / 10,
    city: result.city,
    isOnline: result.isAvailable,
    isVerified: result.isVerified,
    skills: [],
    portfolio: [],
    certificates: [],
    reviews: [],
  };
}

export const artisansApi = {
  /** Artisans near the origin, nearest first. Works signed in or out. */
  searchNearby: async (origin: SearchOrigin, filters: NearbySearchFilters = {}): Promise<ArtisanProfile[]> => {
    try {
      const res = await apiClient.get<ApiResponse<PaginatedList<ArtisanSummaryResult>>>("/artisans/nearby", {
        params: {
          latitude: origin.latitude,
          longitude: origin.longitude,
          radiusKm: filters.maxDistanceKm,
          trade: filters.trade || undefined,
          verifiedOnly: filters.verifiedOnly || undefined,
          availableOnly: filters.onlineOnly || undefined,
          pageNumber: 1,
          pageSize: PAGE_SIZE,
        },
      });
      return unwrap(res.data).items.map(toArtisan);
    } catch (err) {
      return rethrowApiError(err);
    }
  },

  /** One artisan's public profile; null if not found. Pass an origin to get a distance. */
  getById: async (id: string, origin?: SearchOrigin | null): Promise<ArtisanProfile | null> => {
    try {
      const res = await apiClient.get<ApiResponse<ArtisanSummaryResult>>(`/artisans/${id}`, {
        params: origin ? { latitude: origin.latitude, longitude: origin.longitude } : undefined,
      });
      return toArtisan(unwrap(res.data));
    } catch (err) {
      if (isAxiosError(err) && err.response?.status === 404) return null;
      return rethrowApiError(err);
    }
  },

  /** The signed-in user's own profile, including their artisan details and location. */
  getMyProfile: async (): Promise<MyProfileResult> => {
    try {
      const res = await apiClient.get<ApiResponse<MyProfileResult>>("/users/me");
      return unwrap(res.data);
    } catch (err) {
      return rethrowApiError(err);
    }
  },

  updateMyProfile: async (input: UpdateMyArtisanProfileInput): Promise<MyProfileResult> => {
    try {
      const res = await apiClient.put<ApiResponse<MyProfileResult>>("/artisans/me/profile", input);
      return unwrap(res.data);
    } catch (err) {
      return rethrowApiError(err);
    }
  },
};
