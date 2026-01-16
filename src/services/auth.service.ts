import api from "./api";
import type { LoginRequest, LoginResponse, ApiResponse } from "../types";

export const authService = {
  // Login
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await api.post<ApiResponse<LoginResponse>>(
      "/auth/login",
      credentials
    );
    return response.data.data!;
  },

  // Get current user profile
  getMe: async (): Promise<LoginResponse> => {
    const response = await api.get<ApiResponse<LoginResponse>>("/auth/me");
    return response.data.data!;
  },

  // Change password
  changePassword: async (
    currentPassword: string,
    newPassword: string
  ): Promise<void> => {
    await api.put("/auth/change-password", { currentPassword, newPassword });
  },

  // Logout
  logout: async (): Promise<void> => {
    await api.post("/auth/logout");
  },
};
