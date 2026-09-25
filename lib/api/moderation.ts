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
  const path = targetType === "Photo" ? `/photos/${targetId}/reports` : `/comments/${targetId}/reports`;
  return apiFetch<Report>(path, {
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

export function getModerationActions(token: string, cursor?: string, limit?: number) {
  const query = new URLSearchParams({
    ...(cursor ? { cursor } : {}),
    ...(limit ? { limit: String(limit) } : {}),
  });
  const suffix = query.size > 0 ? `?${query}` : "";
  return apiFetch<CursorPage<ModerationAction>>(`/moderation/actions${suffix}`, { token });
}
