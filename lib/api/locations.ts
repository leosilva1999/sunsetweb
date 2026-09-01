import { apiFetch } from "@/lib/api/client";
import type { Location } from "@/types/location";
import type { Photo } from "@/types/photo";
import type { CursorPage } from "@/types/pagination";

export interface LocationSearchParams {
  q?: string;
  lat?: number;
  lng?: number;
  radius?: number;
  cursor?: string;
}

export function searchLocations(params: LocationSearchParams = {}) {
  const query = new URLSearchParams(
    Object.entries(params)
      .filter(([, value]) => value !== undefined)
      .map(([key, value]) => [key, String(value)]),
  );
  return apiFetch<CursorPage<Location>>(`/locations?${query}`);
}

export function getLocation(id: string) {
  return apiFetch<Location>(`/locations/${id}`);
}

export function createLocation(data: Pick<Location, "name" | "latitude" | "longitude" | "city">, token: string) {
  return apiFetch<Location>("/locations", {
    method: "POST",
    body: JSON.stringify(data),
    token,
  });
}

export function getLocationPhotos(id: string, cursor?: string) {
  const query = cursor ? `?cursor=${cursor}` : "";
  return apiFetch<CursorPage<Photo>>(`/locations/${id}/photos${query}`);
}

export function getLocationRanking(period?: "week" | "month" | "all") {
  const query = period ? `?period=${period}` : "";
  return apiFetch<Location[]>(`/locations/ranking${query}`);
}

export function rateLocation(id: string, score: 1 | 2 | 3 | 4 | 5, token: string) {
  return apiFetch<void>(`/locations/${id}/ratings`, {
    method: "POST",
    body: JSON.stringify({ score }),
    token,
  });
}
