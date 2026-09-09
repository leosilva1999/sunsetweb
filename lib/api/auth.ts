import { apiFetch } from "@/lib/api/client";
import type { User } from "@/types/user";
import type { Photo } from "@/types/photo";
import type { CursorPage } from "@/types/pagination";

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

export function updateMe(
  data: Partial<{ name: string; avatarUrl: string | null; bio: string | null }>,
  token: string,
) {
  return apiFetch<User>("/users/me", {
    method: "PATCH",
    body: JSON.stringify(data),
    token,
  });
}

export function getUserPhotos(id: string, cursor?: string, limit?: number) {
  const query = new URLSearchParams({
    ...(cursor ? { cursor } : {}),
    ...(limit ? { limit: String(limit) } : {}),
  });
  const suffix = query.size > 0 ? `?${query}` : "";
  return apiFetch<CursorPage<Photo>>(`/users/${id}/photos${suffix}`);
}
