import { apiFetch, ApiError } from "@/lib/api/client";
import type { Location, SunsetTime } from "@/types/location";
import type { Photo } from "@/types/photo";
import type { CursorPage } from "@/types/pagination";
import type { Rating, RatingScore } from "@/types/rating";

export interface LocationSearchParams {
  q?: string;
  lat?: number;
  lng?: number;
  radius?: number;
  cursor?: string;
  limit?: number;
}

export function searchLocations(params: LocationSearchParams = {}) {
  const query = new URLSearchParams(
    Object.entries(params)
      .filter(([, value]) => value !== undefined)
      .map(([key, value]) => [key, String(value)]),
  );
  const suffix = query.size > 0 ? `?${query}` : "";
  return apiFetch<CursorPage<Location>>(`/locations${suffix}`);
}

export function getLocation(id: string) {
  return apiFetch<Location>(`/locations/${id}`);
}

export function createLocation(
  data: { name: string; latitude: number; longitude: number; city: string },
  token: string,
) {
  return apiFetch<Location>("/locations", {
    method: "POST",
    body: JSON.stringify(data),
    token,
  });
}

export function getLocationPhotos(id: string, cursor?: string, limit?: number) {
  const query = new URLSearchParams({
    ...(cursor ? { cursor } : {}),
    ...(limit ? { limit: String(limit) } : {}),
  });
  const suffix = query.size > 0 ? `?${query}` : "";
  return apiFetch<CursorPage<Photo>>(`/locations/${id}/photos${suffix}`);
}

export function getLocationRanking(period?: "week" | "month" | "all", limit?: number) {
  const query = new URLSearchParams({
    ...(period ? { period } : {}),
    ...(limit ? { limit: String(limit) } : {}),
  });
  const suffix = query.size > 0 ? `?${query}` : "";
  return apiFetch<Location[]>(`/locations/ranking${suffix}`);
}

export function getLocationSunset(id: string, date?: string) {
  const suffix = date ? `?date=${date}` : "";
  return apiFetch<SunsetTime>(`/locations/${id}/sunset${suffix}`);
}

export function getLocationRatings(id: string, cursor?: string, limit?: number) {
  const query = new URLSearchParams({
    ...(cursor ? { cursor } : {}),
    ...(limit ? { limit: String(limit) } : {}),
  });
  const suffix = query.size > 0 ? `?${query}` : "";
  return apiFetch<CursorPage<Rating>>(`/locations/${id}/ratings${suffix}`);
}

// 404 aqui significa "ainda não avaliou", não uma falha — devolve null nesse
// caso em vez de deixar o ApiError estourar, pra chamador não precisar de try/catch.
export async function getMyRating(id: string, token: string): Promise<Rating | null> {
  try {
    return await apiFetch<Rating>(`/locations/${id}/ratings/me`, { token });
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return null;
    throw err;
  }
}

export function rateLocation(id: string, data: { score: RatingScore; comment?: string | null }, token: string) {
  return apiFetch<Rating>(`/locations/${id}/ratings`, {
    method: "POST",
    body: JSON.stringify(data),
    token,
  });
}

export function deleteRating(id: string, token: string) {
  return apiFetch<void>(`/locations/${id}/ratings`, { method: "DELETE", token });
}
