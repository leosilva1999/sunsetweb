import { apiFetch } from "@/lib/api/client";
import type { User, PublicUser, AvatarUploadUrl } from "@/types/user";
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

export function loginWithGoogle(idToken: string) {
  return apiFetch<AuthResponse>("/auth/google", {
    method: "POST",
    body: JSON.stringify({ idToken }),
  });
}

export function forgotPassword(email: string) {
  return apiFetch<void>("/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export function resetPassword(token: string, newPassword: string) {
  return apiFetch<void>("/auth/reset-password", {
    method: "POST",
    body: JSON.stringify({ token, newPassword }),
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
  return apiFetch<PublicUser>(`/users/${id}`);
}

export function followUser(id: string, token: string) {
  return apiFetch<void>(`/users/${id}/follow`, { method: "POST", token });
}

export function unfollowUser(id: string, token: string) {
  return apiFetch<void>(`/users/${id}/follow`, { method: "DELETE", token });
}

export function getUserFollowers(id: string, cursor?: string, limit?: number) {
  const query = new URLSearchParams({
    ...(cursor ? { cursor } : {}),
    ...(limit ? { limit: String(limit) } : {}),
  });
  const suffix = query.size > 0 ? `?${query}` : "";
  return apiFetch<CursorPage<PublicUser>>(`/users/${id}/followers${suffix}`);
}

export function getUserFollowing(id: string, cursor?: string, limit?: number) {
  const query = new URLSearchParams({
    ...(cursor ? { cursor } : {}),
    ...(limit ? { limit: String(limit) } : {}),
  });
  const suffix = query.size > 0 ? `?${query}` : "";
  return apiFetch<CursorPage<PublicUser>>(`/users/${id}/following${suffix}`);
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

export function deleteMe(token: string) {
  return apiFetch<void>("/users/me", { method: "DELETE", token });
}

export function createAvatarUploadUrl(contentType: string, token: string) {
  return apiFetch<AvatarUploadUrl>("/users/me/avatar-upload-url", {
    method: "POST",
    body: JSON.stringify({ contentType }),
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
