import { apiClient } from "./client";
import type { ApiResponse } from "@/types/api";
import type {
  AuthResult,
  LoginPayload,
  RegisterPayload,
} from "@/types/auth";

export const authApi = {
  register: (payload: RegisterPayload) =>
    apiClient
      .post<ApiResponse<AuthResult>>("/auth/register", payload)
      .then((res) => res.data),

  login: (payload: LoginPayload) =>
    apiClient
      .post<ApiResponse<AuthResult>>("/auth/login", payload)
      .then((res) => res.data),

  logout: (refreshToken: string) =>
    apiClient
      .post<ApiResponse<null>>("/auth/logout", { refreshToken })
      .then((res) => res.data),
};
