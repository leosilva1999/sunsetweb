import { apiFetch } from "@/lib/api/client";
import type { User, PublicUser, AvatarUploadUrl } from "@/types/user";
import type { Photo } from "@/types/photo";
import type { LegalAcceptance, LegalVersions } from "@/types/legalDocument";
import type { CursorPage } from "@/types/pagination";

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
  user: User;
  // Ausente em sessões salvas antes do campo existir - ver LegalAcceptanceGate.
  legalAcceptance?: LegalAcceptance;
}

// termsVersion/privacyVersion: as versões que a pessoa viu ao aceitar. Opcionais na API; sem
// elas a conta nasce "pendente" e o LegalAcceptanceGate pede o aceite depois.
export function register(data: { name: string; email: string; password: string } & Partial<LegalVersions>) {
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

export function loginWithGoogle(idToken: string, versions?: LegalVersions) {
  return apiFetch<AuthResponse>("/auth/google", {
    method: "POST",
    body: JSON.stringify({ idToken, ...versions }),
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

// token é opcional: sem ele a API trata o chamador como anônimo e devolve
// isFollowedByCurrentUser sempre false.
export function getUser(id: string, token?: string | null) {
  return apiFetch<PublicUser>(`/users/${id}`, { token });
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

export function changePassword(
  data: { currentPassword: string; newPassword: string; refreshToken?: string },
  token: string,
) {
  return apiFetch<void>("/users/me/password", {
    method: "PUT",
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
