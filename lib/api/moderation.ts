import { apiFetch } from "@/lib/api/client";
import type { Report, ReportTargetType, ReportReason, ReportStatus, ModerationAction } from "@/types/report";
import type { User, UserRole } from "@/types/user";
import type { CursorPage } from "@/types/pagination";

export function createReport(
  targetType: ReportTargetType,
  targetId: string,
  reason: ReportReason,
  details: string | null,
  token: string,
) {
  const resource = { Photo: "photos", Comment: "comments", Location: "locations", User: "users" }[targetType];
  return apiFetch<Report>(`/${resource}/${targetId}/reports`, {
    method: "POST",
    body: JSON.stringify({ reason, details }),
    token,
  });
}

export function getReports(status: ReportStatus, token: string, cursor?: string, limit?: number) {
  const query = new URLSearchParams({
    status,
    ...(cursor ? { cursor } : {}),
    ...(limit ? { limit: String(limit) } : {}),
  });
  return apiFetch<CursorPage<Report>>(`/moderation/reports?${query}`, { token });
}

export function resolveReport(id: string, status: "Resolved" | "Dismissed", token: string) {
  return apiFetch<Report>(`/moderation/reports/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
    token,
  });
}

export function searchUsers(token: string, q?: string, cursor?: string, limit?: number) {
  const query = new URLSearchParams({
    ...(q ? { q } : {}),
    ...(cursor ? { cursor } : {}),
    ...(limit ? { limit: String(limit) } : {}),
  });
  const suffix = query.size > 0 ? `?${query}` : "";
  return apiFetch<CursorPage<User>>(`/moderation/users${suffix}`, { token });
}

export function changeUserRole(userId: string, role: UserRole, token: string) {
  return apiFetch<User>(`/moderation/users/${userId}/role`, {
    method: "PATCH",
    body: JSON.stringify({ role }),
    token,
  });
}

// until (ISO 8601 UTC) omitido = banimento permanente.
export function banUser(userId: string, reason: string, until: string | null, token: string) {
  return apiFetch<void>(`/moderation/users/${userId}/ban`, {
    method: "POST",
    body: JSON.stringify({ reason, ...(until ? { until } : {}) }),
    token,
  });
}

export function unbanUser(userId: string, token: string) {
  return apiFetch<void>(`/moderation/users/${userId}/ban`, { method: "DELETE", token });
}

export function getModerationActions(token: string, cursor?: string, limit?: number) {
  const query = new URLSearchParams({
    ...(cursor ? { cursor } : {}),
    ...(limit ? { limit: String(limit) } : {}),
  });
  const suffix = query.size > 0 ? `?${query}` : "";
  return apiFetch<CursorPage<ModerationAction>>(`/moderation/actions${suffix}`, { token });
}
