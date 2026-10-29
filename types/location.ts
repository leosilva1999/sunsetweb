export interface Location {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  city: string;
  avgRating: number;
  // Só preenchido na busca "perto de mim" (lat/lng enviados); null no resto.
  distanceKm: number | null;
  createdAt: string;
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
