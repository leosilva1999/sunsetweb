interface LocationMapProps {
  latitude?: number;
  longitude?: number;
  name?: string;
}

const FALLBACK_CLASSES =
  "flex h-80 w-full max-w-2xl items-center justify-center rounded-2xl border border-white/10 bg-dusk-900 text-sm text-cream-dim opacity-70 light:border-line light:bg-paper-dim light:text-ink-dim light:opacity-100";

export default function LocationMap({ latitude, longitude, name }: LocationMapProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!latitude || !longitude || !apiKey) {
    return (
      <div className={FALLBACK_CLASSES}>
        {latitude && longitude ? `${latitude.toFixed(4)}, ${longitude.toFixed(4)}` : "Mapa em breve"}
      </div>
    );
  }

  const src = `https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${latitude},${longitude}`;

  return (
    <iframe
      title={name ? `Mapa de ${name}` : "Mapa do local"}
      src={src}
      className="h-80 w-full max-w-2xl rounded-2xl border-0"
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
      allowFullScreen
    />
  );
}
