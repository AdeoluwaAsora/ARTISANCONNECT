import axios from "axios";
import type { AuthResult, AuthUser } from "@/types/auth";
import type { ApiResponse } from "@/types/api";

const REFRESH_TOKEN_STORAGE_KEY = "artisanconnect.refreshToken";

let accessToken: string | null = null;
let refreshToken: string | null = null;
let currentUser: AuthUser | null = null;

type Listener = (user: AuthUser | null) => void;
const listeners = new Set<Listener>();

function notify() {
  listeners.forEach((listener) => listener(currentUser));
}

/** Subscribe to session changes (used by AuthContext to sync React state). */
export function subscribeToSession(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getAccessToken(): string | null {
  return accessToken;
}

export function getCurrentUser(): AuthUser | null {
  return currentUser;
}

/**
 * Store a fresh session after login/register/refresh.
 *
 * Security note: this backend returns the refresh token in the response body
 * rather than an httpOnly cookie, so true XSS-proof storage isn't available
 * without a backend change. As a pragmatic middle ground, the access token
 * lives only in memory (lost on tab close), and the refresh token is
 * persisted to localStorage ONLY when the user opts into "remember me" —
 * otherwise it's memory-only too, and the user simply has to log in again
 * after closing the tab.
 */
export function setSession(auth: AuthResult, persist: boolean) {
  accessToken = auth.accessToken;
  refreshToken = auth.refreshToken;
  currentUser = {
    userId: auth.userId,
    email: auth.email,
    firstName: auth.firstName,
    lastName: auth.lastName,
    role: auth.role,
  };

  if (persist) {
    localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, auth.refreshToken);
  } else {
    localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
  }

  notify();
}

export function clearSession() {
  accessToken = null;
  refreshToken = null;
  currentUser = null;
  localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
  notify();
}

/**
 * Attempts to restore a session on app load using a persisted refresh token
 * (if the user previously checked "remember me"). Returns true if restored.
 */
export async function restoreSession(): Promise<boolean> {
  const storedRefreshToken = localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY);
  if (!storedRefreshToken) return false;

  refreshToken = storedRefreshToken;
  const newAccessToken = await refreshSession();
  return newAccessToken !== null;
}

/**
 * Calls /auth/refresh-token directly via a bare axios instance (NOT the
 * shared apiClient) to avoid triggering its own response interceptor and
 * creating a circular import between client.ts and this module.
 */
export async function refreshSession(): Promise<string | null> {
  if (!refreshToken) return null;

  try {
    const response = await axios.post<ApiResponse<AuthResult>>(
      `${import.meta.env.VITE_API_BASE_URL}/auth/refresh-token`,
      { refreshToken },
    );

    if (response.data.success) {
      const wasPersisted = Boolean(
        localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY),
      );
      setSession(response.data.data, wasPersisted);
      return response.data.data.accessToken;
    }

    clearSession();
    return null;
  } catch {
    clearSession();
    return null;
  }
}
