export interface Coordinates {
  lat: number;
  lng: number;
}

export function formatCoordinates({ lat, lng }: Coordinates) {
  return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
}

export function getCurrentPosition(): Promise<Coordinates> {
  return new Promise((resolve, reject) => {
    if (!("geolocation" in navigator)) {
      reject(new Error("Geolocalização não é suportada neste navegador."));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) =>
        resolve({ lat: position.coords.latitude, lng: position.coords.longitude }),
      reject,
    );
  });
}
