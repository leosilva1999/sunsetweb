interface LocationMapProps {
  latitude?: number;
  longitude?: number;
}

// Provedor de mapas (Mapbox/Google Maps/Leaflet) ainda não decidido — placeholder até a escolha.
export default function LocationMap({ latitude, longitude }: LocationMapProps) {
  return (
    <div className="flex aspect-video items-center justify-center rounded-2xl border border-white/10 bg-dusk-900 text-sm text-cream-dim opacity-70 light:border-line light:bg-paper-dim light:text-ink-dim light:opacity-100">
      {latitude && longitude ? `${latitude.toFixed(4)}, ${longitude.toFixed(4)}` : "Mapa em breve"}
    </div>
  );
}
