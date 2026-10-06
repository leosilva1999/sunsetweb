import { apiFetch } from "@/lib/api/client";
import type { Notification } from "@/types/notification";
import type { CursorPage } from "@/types/pagination";

export function getNotifications(token: string, cursor?: string, limit?: number) {
  const query = new URLSearchParams({
    ...(cursor ? { cursor } : {}),
    ...(limit ? { limit: String(limit) } : {}),
  });
  const suffix = query.size > 0 ? `?${query}` : "";
  return apiFetch<CursorPage<Notification>>(`/notifications${suffix}`, { token });
}

export function getUnreadNotificationCount(token: string) {
  return apiFetch<{ count: number }>("/notifications/unread-count", { token });
}

export function markNotificationRead(id: string, token: string) {
  return apiFetch<void>(`/notifications/${id}/read`, { method: "POST", token });
}

export function markAllNotificationsRead(token: string) {
  return apiFetch<void>("/notifications/read-all", { method: "POST", token });
}
