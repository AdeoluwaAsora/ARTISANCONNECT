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
  id: string;
  name: string;
  initials: string;
  trade: string;
  bio: string;
  rating: number;
  reviewCount: number;
  jobsCompleted: number;
  yearsExperience: number;
  hourlyRate: number;
  distanceKm: number;
  isOnline: boolean;
  isVerified: boolean;
  skills: string[];
  portfolio: PortfolioItem[];
  certificates: Certificate[];
  reviews: ArtisanReview[];
}
