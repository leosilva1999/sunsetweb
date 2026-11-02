export type CityKind = "Municipality" | "Locality";

// Município de uma localidade (null num município).
export interface CityParent {
  id: string;
  name: string;
  state: string;
  slug: string;
}

// CityResponse - item de GET /cities e de /cities/ranking.
export interface City {
  id: string;
  kind: CityKind;
  name: string;
  country: string;
  state: string;
  // Chave pública da URL, imutável: "imbituba-sc", "praia-do-rosa-imbituba-sc".
  slug: string;
  parent: CityParent | null;
  timeZoneId: string;
  population: number;
  latitude: number;
  longitude: number;
  locationsCount: number;
  photosCount: number;
  ratingsCount: number;
  // Média de todas as avaliações dos locais; null sem avaliações.
  avgRating: number | null;
  coverImageUrl: string | null;
}

// GET /cities/{slug} - a página inteira da cidade numa chamada.
export interface CityDetail extends City {
  topLocation: { id: string; name: string; avgRating: number } | null;
  // Localidades que têm locais (até 10), pra links internos. Vazio numa localidade.
  localities: { name: string; slug: string; locationsCount: number }[];
}

export type CitySort = "locations" | "rating" | "population" | "name";
export type CityListKind = "municipality" | "locality" | "any";

export interface CityRankingItem {
  city: City;
  periodAvgRating: number;
  periodRatingsCount: number;
}

// GET /geo/cities - lugares do catálogo mais próximos de um pino.
export interface NearbyCity {
  id: string;
  kind: CityKind;
  name: string;
  state: string;
  slug: string;
  distanceKm: number;
  parent: CityParent | null;
}

export interface GeoCitiesResponse {
  items: NearbyCity[];
  // Só vem quando se envia cityId. farAway = pino a mais de 150 km: aviso, nunca bloqueio.
  chosenCity?: { id: string; name: string; state: string; distanceKm: number; farAway: boolean };
}

export type SitemapEntryType = "city" | "locality" | "location" | "photo";

export interface SitemapEntry {
  id: string;
  // null em fotos (endereçadas pelo id).
  slug: string | null;
  lastModified: string;
}

