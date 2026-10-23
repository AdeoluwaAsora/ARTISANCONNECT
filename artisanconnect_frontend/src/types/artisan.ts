export interface PortfolioItem {
  id: string;
  imageUrl: string;
  caption: string;
}

export interface Certificate {
  id: string;
  name: string;
  issuer: string;
  issuedYear: number;
  verified: boolean;
}

export interface ArtisanReview {
  id: string;
  customerName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface ArtisanProfile {
  /** The artisan's user id (same id bids and job assignment use). */
  id: string;
  name: string;
  initials: string;
  /** Display label, e.g. "AC Technician". */
  trade: string;
  bio: string;
  /** Null until Reviews & Ratings exists. */
  rating: number | null;
  reviewCount: number | null;
  jobsCompleted: number;
  yearsExperience: number;
  hourlyRate: number | null;
  /** Null when there's no search origin to measure from. */
  distanceKm: number | null;
  city: string | null;
  /** Backend IsAvailable: the artisan is taking new work. */
  isOnline: boolean;
  isVerified: boolean;
  // Not stored by the backend yet (Reviews / File uploads); always empty for now.
  skills: string[];
  portfolio: PortfolioItem[];
  certificates: Certificate[];
  reviews: ArtisanReview[];
}

/** Matches the backend's ArtisanSummaryResult (public; never includes coordinates). */
export interface ArtisanSummaryResult {
  artisanId: string;
  name: string;
  trade: string;
  yearsOfExperience: number;
  bio: string | null;
  hourlyRate: number | null;
  isVerified: boolean;
  isAvailable: boolean;
  profilePictureUrl: string | null;
  city: string | null;
  distanceKm: number | null;
  jobsCompleted: number;
}

/** The artisan part of GET /users/me (only ever about the signed-in artisan). */
export interface MyArtisanProfileResult {
  trade: string;
  yearsOfExperience: number;
  isVerified: boolean;
  isAvailable: boolean;
  bio: string | null;
  hourlyRate: number | null;
  profilePictureUrl: string | null;
  latitude: number | null;
  longitude: number | null;
  city: string | null;
}

/** Matches the backend's UserProfileResult (GET /users/me). */
export interface MyProfileResult {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string | null;
  role: string;
  isEmailVerified: boolean;
  lastLoginAtUtc: string | null;
  artisanProfile: MyArtisanProfileResult | null;
}

/** Body for PUT /artisans/me/profile. Coordinates: both or neither (clears location). */
export interface UpdateMyArtisanProfileInput {
  trade: number;
  yearsOfExperience: number;
  bio: string | null;
  hourlyRate: number | null;
  isAvailable: boolean;
  latitude: number | null;
  longitude: number | null;
  city: string | null;
}

/** Where a nearby search measures distance from. */
export interface SearchOrigin {
  latitude: number;
  longitude: number;
  /** What to show the user, e.g. "your location" or "Lagos". */
  label: string;
  source: "gps" | "city";
}

export interface NearbySearchFilters {
  /** Backend trade name, e.g. "AcTechnician". */
  trade?: string;
  maxDistanceKm?: number;
  verifiedOnly?: boolean;
  onlineOnly?: boolean;
}
