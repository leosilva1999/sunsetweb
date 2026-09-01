import { apiFetch } from "@/lib/api/client";
import type { User } from "@/types/user";

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
}

export function register(data: { name: string; email: string; password: string }) {
  return apiFetch<AuthTokens>("/auth/register", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function login(data: { email: string; password: string }) {
  return apiFetch<AuthTokens>("/auth/login", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function refresh(refreshToken: string) {
  return apiFetch<AuthTokens>("/auth/refresh", {
    method: "POST",
    body: JSON.stringify({ refresh_token: refreshToken }),
  });
}

export function logout(token: string) {
  return apiFetch<void>("/auth/logout", { method: "POST", token });
}

export function getUser(id: string) {
  return apiFetch<User>(`/users/${id}`);
}

export function updateMe(data: Partial<Pick<User, "name" | "avatar_url">>, token: string) {
  return apiFetch<User>("/users/me", {
    method: "PATCH",
    body: JSON.stringify(data),
    token,
  });
}
