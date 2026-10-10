export interface Coordinates {
  lat: number;
  lng: number;
}

export function formatCoordinates({ lat, lng }: Coordinates) {
  return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
}

export type GeolocationFailureReason = "unsupported" | "denied" | "unavailable" | "timeout";

export class GeolocationFailure extends Error {
  constructor(public reason: GeolocationFailureReason) {
    super(reason);
  }
}

const REASON_BY_CODE: Record<number, GeolocationFailureReason> = { 1: "denied", 2: "unavailable", 3: "timeout" };

// maximumAge de 5min: reativar "perto de mim" logo depois não refaz a leitura de GPS.
// Precisão alta não compensa aqui — raio mínimo é 10 km.
export function getCurrentPosition(): Promise<Coordinates> {
  return new Promise((resolve, reject) => {
    if (!("geolocation" in navigator)) {
      reject(new GeolocationFailure("unsupported"));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => resolve({ lat: position.coords.latitude, lng: position.coords.longitude }),
      (error) => reject(new GeolocationFailure(REASON_BY_CODE[error.code] ?? "unavailable")),
      { enableHighAccuracy: false, timeout: 10_000, maximumAge: 300_000 },
    );
  });
}

export function formatDistance(km: number) {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toLocaleString("pt-BR", { maximumFractionDigits: 1 })} km`;
}
