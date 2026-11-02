import { apiFetch } from "@/lib/api/client";
import { tagged } from "@/lib/api/tags";
import type {
  City,
  CityDetail,
  CityListKind,
  CityRankingItem,
  CitySort,
  GeoCitiesResponse,
  SitemapEntry,
  SitemapEntryType,
} from "@/types/city";
import type { Location, SunsetTime } from "@/types/location";
import type { Photo } from "@/types/photo";
import type { CursorPage } from "@/types/pagination";

function toQuery(params: Record<string, string | number | boolean | undefined>) {
  const query = new URLSearchParams(
    Object.entries(params)
      .filter(([, value]) => value !== undefined && value !== "")
      .map(([key, value]) => [key, String(value)]),
  );
  return query.size > 0 ? `?${query}` : "";
}

export interface CitySearchParams {
  // Com q (mín. 2 caracteres) a chamada conta no rate limit de busca: use debounce.
  q?: string;
  kind?: CityListKind;
  country?: string;
  state?: string;
  sort?: CitySort;
  // true = catálogo inteiro (precisa de sort=population ou name). Padrão da API: só cidades com locais.
  includeEmpty?: boolean;
  cursor?: string;
  limit?: number;
}

export function searchCities(params: CitySearchParams = {}) {
  return apiFetch<CursorPage<City>>(`/cities${toQuery({ ...params })}`, tagged("cities"));
}

// Autocomplete do cadastro de local: o catálogo todo, mais populosas primeiro.
export function searchCitiesForRegistration(q: string, limit = 8) {
  return searchCities({ q, kind: "any", includeEmpty: true, sort: "population", limit });
}

// 404 = slug desconhecido, cidade inativa ou sem local visível (sem página).
export function getCity(slug: string) {
  return apiFetch<CityDetail>(`/cities/${slug}`, tagged("cities"));
}

export function getCityLocations(slug: string, sort?: "rating" | "recent" | "name", cursor?: string, limit?: number) {
  return apiFetch<CursorPage<Location>>(
    `/cities/${slug}/locations${toQuery({ sort, cursor, limit })}`,
    tagged("cities"),
  );
}

// token opcional: com ele likedByCurrentUser vem certo (e a resposta deixa de ser cacheada).
export function getCityPhotos(
  slug: string,
  sort?: "top" | "recent",
  cursor?: string,
  limit?: number,
  token?: string | null,
) {
  return apiFetch<CursorPage<Photo>>(`/cities/${slug}/photos${toQuery({ sort, cursor, limit })}`, {
    token,
    ...tagged("cities"),
  });
}

export function getCitySunset(slug: string, date?: string) {
  return apiFetch<SunsetTime>(`/cities/${slug}/sunset${toQuery({ date })}`);
}

export function getCityRanking(period?: "week" | "month" | "all", limit?: number) {
  return apiFetch<CityRankingItem[]>(`/cities/ranking${toQuery({ period, limit })}`, tagged("cities"));
}

// Cidades do catálogo mais próximas de um pino; com cityId, também a distância até a escolhida.
export function getGeoCities(lat: number, lng: number, options: { limit?: number; cityId?: string } = {}) {
  return apiFetch<GeoCitiesResponse>(`/geo/cities${toQuery({ lat, lng, ...options })}`);
}

// Tudo que tem página pública, enxuto, pro sitemap. Siga nextCursor até hasMore ser false.
export function getSitemapEntries(type: SitemapEntryType, cursor?: string, limit = 1000) {
  return apiFetch<CursorPage<SitemapEntry>>(`/sitemap/entries${toQuery({ type, cursor, limit })}`);
}
