import type { ArtisanProfile } from "@/types/artisan";
import { delay } from "./delay";

const trades = [
  "Electrician",
  "Plumber",
  "Carpenter",
  "Mechanic",
  "Painter",
  "AC Technician",
];

const names = [
  "Chidi Okafor",
  "Amaka Titus",
  "Bala Musa",
  "Ngozi Eze",
  "Tunde Bakare",
  "Funke Adeyemi",
  "David Kalu",
  "Blessing Nwosu",
  "Ibrahim Sule",
  "Grace Effiong",
  "Emeka Chukwu",
  "Halima Bello",
];

function initialsOf(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export const mockArtisans: ArtisanProfile[] = names.map((name, i) => ({
  id: `artisan-${i + 1}`,
  name,
  initials: initialsOf(name),
  trade: trades[i % trades.length],
  bio: `${name.split(" ")[0]} has spent ${4 + (i % 12)} years working across residential and commercial ${trades[
    i % trades.length
  ].toLowerCase()} jobs, known for punctuality and clean work.`,
  rating: Number((4.5 + ((i % 5) * 0.1)).toFixed(1)),
  reviewCount: 40 + i * 17,
  jobsCompleted: 60 + i * 23,
  yearsExperience: 4 + (i % 12),
  hourlyRate: 3500 + (i % 5) * 500,
  distanceKm: Number((0.6 + i * 0.4).toFixed(1)),
  isOnline: i % 3 !== 0,
  isVerified: i % 4 !== 3,
  skills: ["Diagnostics", "Installation", "Repairs", "Emergency callout"].slice(
    0,
    2 + (i % 3),
  ),
  portfolio: Array.from({ length: 4 }).map((_, p) => ({
    id: `${i}-portfolio-${p}`,
    imageUrl: "",
    caption: `${trades[i % trades.length]} job #${p + 1}`,
  })),
  certificates: [
    {
      id: `${i}-cert-1`,
      name: `Certified ${trades[i % trades.length]}`,
      issuer: "National Board for Technical Education",
      issuedYear: 2018 + (i % 6),
      verified: i % 4 !== 3,
    },
  ],
  reviews: [
    {
      id: `${i}-review-1`,
      customerName: "Funke A.",
      rating: 5,
      comment: "Showed up on time and fixed the issue fast. Would hire again.",
      createdAt: "2026-05-12T10:00:00Z",
    },
    {
      id: `${i}-review-2`,
      customerName: "David K.",
      rating: 4,
      comment: "Good work overall, communication could be a bit quicker.",
      createdAt: "2026-04-02T10:00:00Z",
    },
  ],
}));

export const artisansApi = {
  getNearby: (filters?: {
    trade?: string;
    verifiedOnly?: boolean;
    onlineOnly?: boolean;
    maxDistanceKm?: number;
    minRating?: number;
  }) => {
    let results = mockArtisans;
    if (filters?.trade) {
      results = results.filter((a) => a.trade === filters.trade);
    }
    if (filters?.verifiedOnly) {
      results = results.filter((a) => a.isVerified);
    }
    if (filters?.onlineOnly) {
      results = results.filter((a) => a.isOnline);
    }
    if (filters?.maxDistanceKm !== undefined) {
      results = results.filter((a) => a.distanceKm <= filters.maxDistanceKm!);
    }
    if (filters?.minRating !== undefined) {
      results = results.filter((a) => a.rating >= filters.minRating!);
    }
    return delay(results, 400);
  },

  getById: (id: string) => delay(mockArtisans.find((a) => a.id === id) ?? null, 300),
};
