import { apiFetch } from "@/lib/api/client";
import type { User } from "@/types/user";

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
  user: User;
}

export function register(data: { name: string; email: string; password: string }) {
  return apiFetch<AuthResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function login(data: { email: string; password: string }) {
  return apiFetch<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function refresh(refreshToken: string) {
  return apiFetch<AuthResponse>("/auth/refresh", {
    method: "POST",
    body: JSON.stringify({ refreshToken }),
  });
}

export function logout(refreshToken: string) {
  return apiFetch<void>("/auth/logout", {
    method: "POST",
    body: JSON.stringify({ refreshToken }),
  });
}

export function getUser(id: string) {
  return apiFetch<User>(`/users/${id}`);
}

export function updateMe(data: { name: string; avatarUrl: string | null }, token: string) {
  return apiFetch<User>("/users/me", {
    method: "PATCH",
    body: JSON.stringify(data),
    token,
  });
}
