import { api } from "./api";
import type { ApiSuccess } from "../types/api";
import type { AuthResponse, LoginPayload, RegisterPayload, User } from "../types/auth";

export async function login(payload: LoginPayload): Promise<AuthResponse> {
  const response = await api.post<ApiSuccess<AuthResponse>>("/auth/login", payload);
  return response.data.data;
}

export async function register(payload: RegisterPayload): Promise<AuthResponse> {
  const response = await api.post<ApiSuccess<AuthResponse>>("/auth/register", payload);
  return response.data.data;
}

export async function getCurrentUser(): Promise<User> {
  const response = await api.get<ApiSuccess<User>>("/auth/me");
  return response.data.data;
}
