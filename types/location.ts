export type LocationCategory = "Beach" | "Viewpoint" | "Mountain" | "Lake" | "River" | "Urban" | "Other";

export interface Location {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  // Texto legado: "{cityName} - {state}" quando o local está ligado ao catálogo, senão o
  // que foi digitado. Pra link e agrupamento use citySlug/cityName/state.
  city: string;
  avgRating: number;
  // Só preenchido na busca "perto de mim" (lat/lng enviados) e em /nearby; null no resto.
  distanceKm: number | null;
  createdAt: string;
  // Chave pública da URL (imutável). GET /locations/{idOrSlug} aceita o GUID ou o slug.
  slug: string;
  // Município do catálogo; null enquanto o local não está ligado a um (fila de moderação).
  citySlug: string | null;
  cityName: string | null;
  state: string | null;
  // Localidade dentro do município (ex.: praia, distrito), quando escolhida.
  localityName: string | null;
  localitySlug: string | null;
  ratingsCount: number;
  photosCount: number;
  // Foto mais curtida do local; null sem fotos.
  coverImageUrl: string | null;
  description: string | null;
  category: LocationCategory | null;
}

export interface SunsetTime {
  date: string;
  tzId: string;
  utcOffset: string;
  sunrise: string;
  sunset: string;
  solarNoon: string;
  dayLengthSeconds: number;
}

// Item de GET /moderation/locations/deleted (lista de locais excluídos, pra restaurar).
export interface DeletedLocation {
  id: string;
  name: string;
  city: string;
  latitude: number;
  longitude: number;
  deletedAt: string;
  deletedByUserId: string | null;
}
