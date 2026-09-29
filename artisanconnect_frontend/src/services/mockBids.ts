import type { Bid } from "@/types/bid";
import { delay } from "./delay";
import { mockArtisans } from "./mockArtisans";

let bids: Bid[] = [
  {
    id: "bid-1",
    jobId: "job-1",
    artisanId: "artisan-2",
    artisanName: "Amaka Titus",
    artisanRating: 5.0,
    artisanDistanceKm: 0.8,
    artisanInitials: "AT",
    amount: 12000,
    etaMinutes: 25,
    message: "Can come by this afternoon, I have the part in stock already.",
    status: "pending",
    submittedAt: "2026-07-01T10:00:00Z",
  },
  {
    id: "bid-2",
    jobId: "job-1",
    artisanId: "artisan-6",
    artisanName: "Funke Adeyemi",
    artisanRating: 4.7,
    artisanDistanceKm: 2.1,
    artisanInitials: "FA",
    amount: 9500,
    etaMinutes: 50,
    message: "Available tomorrow morning, price includes the washer replacement.",
    status: "pending",
    submittedAt: "2026-07-01T11:30:00Z",
  },
  {
    id: "bid-3",
    jobId: "job-1",
    artisanId: "artisan-10",
    artisanName: "Grace Effiong",
    artisanRating: 4.8,
    artisanDistanceKm: 3.4,
    artisanInitials: "GE",
    amount: 15000,
    etaMinutes: 70,
    message: "Happy to take a look today, price may adjust slightly after inspection.",
    status: "pending",
    submittedAt: "2026-07-01T12:10:00Z",
  },
];

export const bidsApi = {
  getForJob: (jobId: string) => delay(bids.filter((b) => b.jobId === jobId), 350),

  getByArtisan: (artisanId: string) =>
    delay(bids.filter((b) => b.artisanId === artisanId), 350),

  submit: (input: {
    jobId: string;
    artisanId: string;
    amount: number;
    etaMinutes: number;
    message: string;
  }) => {
    const artisan = mockArtisans.find((a) => a.id === input.artisanId);
    const newBid: Bid = {
      id: `bid-${bids.length + 1}`,
      jobId: input.jobId,
      artisanId: input.artisanId,
      artisanName: artisan?.name ?? "You",
      artisanRating: artisan?.rating ?? 5,
      artisanDistanceKm: artisan?.distanceKm ?? 0,
      artisanInitials: artisan?.initials ?? "ME",
      amount: input.amount,
      etaMinutes: input.etaMinutes,
      message: input.message,
      status: "pending",
      submittedAt: new Date().toISOString(),
    };
    bids = [newBid, ...bids];
    return delay(newBid, 450);
  },

  accept: (bidId: string) => {
    bids = bids.map((b) =>
      b.id === bidId
        ? { ...b, status: "accepted" }
        : b.jobId === bids.find((x) => x.id === bidId)?.jobId
          ? { ...b, status: b.status === "pending" ? "rejected" : b.status }
          : b,
    );
    return delay(bids.find((b) => b.id === bidId) ?? null, 350);
  },

  reject: (bidId: string) => {
    bids = bids.map((b) => (b.id === bidId ? { ...b, status: "rejected" } : b));
    return delay(bids.find((b) => b.id === bidId) ?? null, 300);
  },
};
