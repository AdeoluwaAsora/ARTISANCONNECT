
export interface ApiResponse<T> {
  success: boolean;
  message: string | null;
  data: T;
  errors: string[] | null;
  timestampUtc: string;
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
