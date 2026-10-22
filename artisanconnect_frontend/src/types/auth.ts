import type { TradeValue, UserRoleValue } from "./api";

/** Role as returned by the backend inside AuthResult (a string, e.g. "Customer"). */
export type UserRoleName = "Customer" | "Artisan" | "Admin";

/** Matches the backend's AuthResult schema exactly. */
export interface AuthResult {
    userId: string;
    email: string;
    firstName: string;
    lastName: string;
    role: UserRoleName;
    accessToken: string;
    refreshToken: string;
    accessTokenExpiresAtUtc: string;
}

/** The authenticated user, derived from AuthResult, kept in AuthContext. */
export interface AuthUser {
    userId: string;
    email: string;
    firstName: string;
    lastName: string;
    role: UserRoleName;
}

export interface LoginPayload {
    email: string;
    password: string;
}

export interface RegisterPayload {
    email: string;
    password: string;
    confirmPassword: string;
    firstName: string;
    lastName: string;
    phoneNumber?: string;
    role: UserRoleValue;
    /** Artisan accounts only; must be omitted for customers. */
    trade?: TradeValue;
    /** Artisan accounts only; must be omitted for customers. */
    yearsOfExperience?: number;
}

export interface RefreshTokenPayload {
    refreshToken: string;
}