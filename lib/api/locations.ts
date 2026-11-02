import { apiFetch, ApiError } from "@/lib/api/client";
import { tagged } from "@/lib/api/tags";
import type { Location, LocationCategory, SunsetTime } from "@/types/location";
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
  return apiFetch<CursorPage<Location>>(`/locations${suffix}`, tagged("locations"));
}

// idOrSlug: o GUID ou o slug público do local.
export function getLocation(idOrSlug: string) {
  return apiFetch<Location>(`/locations/${idOrSlug}`, tagged("locations"));
}

// Outros locais num raio do local (mais perto primeiro), cada um com distanceKm. Sem paginação.
export function getNearbyLocations(idOrSlug: string, radiusKm?: number, limit?: number) {
  const query = new URLSearchParams({
    ...(radiusKm ? { radiusKm: String(radiusKm) } : {}),
    ...(limit ? { limit: String(limit) } : {}),
  });
  const suffix = query.size > 0 ? `?${query}` : "";
  return apiFetch<Location[]>(`/locations/${idOrSlug}/nearby${suffix}`, tagged("locations"));
}

// POST /locations responde 409 quando acha um local que pode ser o mesmo; os ids vêm em
// errors.candidateLocationIds. Reenviar o mesmo corpo com confirmDistinct: true cria assim mesmo.
export function getDuplicateCandidateIds(err: unknown): string[] | null {
  if (!(err instanceof ApiError) || err.status !== 409) return null;
  const ids = err.fieldErrors?.candidateLocationIds;
  return ids && ids.length > 0 ? ids : null;
}

export function createLocation(
  data: {
    name: string;
    latitude: number;
    longitude: number;
    // cityId (de GET /cities) é o caminho certo; city em texto livre segue aceito.
    cityId?: string;
    city?: string;
    description?: string;
    category?: LocationCategory;
    confirmDistinct?: boolean;
  },
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
  return apiFetch<CursorPage<Photo>>(`/locations/${id}/photos${suffix}`, tagged("photos"));
}

// citySlug: município (inclui as localidades dele) ou localidade; state: sigla (ex.: "SC").
export function getLocationRanking(
  period?: "week" | "month" | "all",
  limit?: number,
  filters: { citySlug?: string; state?: string } = {},
) {
  const query = new URLSearchParams({
    ...(period ? { period } : {}),
    ...(limit ? { limit: String(limit) } : {}),
    ...(filters.citySlug ? { citySlug: filters.citySlug } : {}),
    ...(filters.state ? { state: filters.state } : {}),
  });
  const suffix = query.size > 0 ? `?${query}` : "";
  return apiFetch<Location[]>(`/locations/ranking${suffix}`, tagged("locations"));
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
  return apiFetch<CursorPage<Rating>>(`/locations/${id}/ratings${suffix}`, tagged("locations"));
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
