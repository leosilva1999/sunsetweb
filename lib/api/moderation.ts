import { apiFetch } from "@/lib/api/client";
import type { Report, ReportTargetType, ReportReason, ReportStatus, ModerationAction } from "@/types/report";
import type { User, UserRole } from "@/types/user";
import type { Location, DeletedLocation } from "@/types/location";
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

// Irreversível. Só Admin. hideContent também esconde fotos e comentários do usuário.
export function anonymizeUser(userId: string, reason: string, hideContent: boolean, token: string) {
  return apiFetch<void>(`/moderation/users/${userId}/anonymize`, {
    method: "POST",
    body: JSON.stringify({ reason, hideContent }),
    token,
  });
}

export function updateLocationCoordinates(locationId: string, latitude: number, longitude: number, token: string) {
  return apiFetch<Location>(`/moderation/locations/${locationId}/coordinates`, {
    method: "PATCH",
    body: JSON.stringify({ latitude, longitude }),
    token,
  });
}

// Exclusão lógica: esconde o local E as fotos dele. Reversível com restoreLocation.
export function deleteLocation(locationId: string, token: string) {
  return apiFetch<void>(`/moderation/locations/${locationId}`, { method: "DELETE", token });
}

export function restoreLocation(locationId: string, token: string) {
  return apiFetch<void>(`/moderation/locations/${locationId}/restore`, { method: "POST", token });
}

// Lista simples (não é paginada por cursor), mais recentes primeiro.
export function getDeletedLocations(token: string, limit?: number) {
  const suffix = limit ? `?limit=${limit}` : "";
  return apiFetch<DeletedLocation[]>(`/moderation/locations/deleted${suffix}`, { token });
}

// O local da URL é o duplicado (some); targetId é o que continua. NÃO dá pra desfazer.
export function mergeLocation(duplicateId: string, targetId: string, token: string) {
  return apiFetch<Location>(`/moderation/locations/${duplicateId}/merge`, {
    method: "POST",
    body: JSON.stringify({ targetId }),
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
