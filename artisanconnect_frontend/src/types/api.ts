
export interface ApiResponse<T> {
  success: boolean;
  message: string | null;
  data: T;
  errors: string[] | null;
  timestampUtc: string;
}

/** Matches the backend's PaginatedList<T> (page size is capped at 50 server-side). */
export interface PaginatedList<T> {
  items: T[];
  pageNumber: number;
  totalPages: number;
  totalCount: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}


export const UserRoleValue = {
  Customer: 1,
  Artisan: 2,
  Admin: 3,
} as const;

export type UserRoleValue = (typeof UserRoleValue)[keyof typeof UserRoleValue];

/**
 * Mirrors the backend's Trade enum (ArtisanConnect.Core/Enums/Trade.cs).
 * The API has no string-enum converter, so request payloads must send the number.
 */
export const TradeValue = {
  Electrician: 1,
  Plumber: 2,
  Carpenter: 3,
  Mechanic: 4,
  Painter: 5,
  Tailor: 6,
  AcTechnician: 7,
  SolarInstaller: 8,
  HousingAgent: 9,
} as const;

export type TradeValue = (typeof TradeValue)[keyof typeof TradeValue];

/** Trade as the backend returns it in responses (the enum member name, e.g. "AcTechnician"). */
export type TradeName = keyof typeof TradeValue;

/** Human-readable label for each trade, for display and <select> options. */
export const TRADE_LABELS: Record<TradeName, string> = {
  Electrician: "Electrician",
  Plumber: "Plumber",
  Carpenter: "Carpenter",
  Mechanic: "Mechanic",
  Painter: "Painter",
  Tailor: "Tailor",
  AcTechnician: "AC Technician",
  SolarInstaller: "Solar Installer",
  HousingAgent: "Housing Agent",
};

export function isTradeName(value: string): value is TradeName {
  return Object.prototype.hasOwnProperty.call(TradeValue, value);
}

/** Label for a backend trade name; falls back to the raw value if it's unknown. */
export function tradeLabel(name: string): string {
  return isTradeName(name) ? TRADE_LABELS[name] : name;
}
