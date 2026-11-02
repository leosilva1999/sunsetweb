import Link from "next/link";
import PhotoImage from "@/components/photo/PhotoImage";
import { locationPath } from "@/lib/utils/locationPath";
import { formatDistance } from "@/lib/utils/geolocation";
import { pluralize } from "@/lib/utils/pluralize";
import type { Location } from "@/types/location";

interface LocationCardProps {
  location: Location;
}

export default function LocationCard({ location }: LocationCardProps) {
  return (
    <Link
      href={locationPath(location)}
      className="block overflow-hidden rounded-2xl border border-white/10 transition-colors hover:border-white/30 light:border-line light:bg-card light:shadow-[0_2px_10px_rgba(74,43,99,0.05)] light:hover:border-line"
    >
      <div className="relative aspect-4/3 overflow-hidden bg-linear-to-br from-sun-mid/40 to-dusk-700">
        {location.coverImageUrl && (
          <PhotoImage
            src={location.coverImageUrl}
            alt={`Pôr do sol em ${location.name}`}
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 100vw"
          />
        )}
      </div>
      <div className="p-5">
        <h3 className="font-display text-lg font-medium">{location.name}</h3>
        <p className="mt-1 font-mono text-xs text-cream-dim opacity-70 light:text-ink-dim light:opacity-100">
          {location.city}
          {location.distanceKm !== null && ` · ${formatDistance(location.distanceKm)}`}
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-xs text-cream-dim light:text-ink-dim">
          <span className="flex items-center gap-1.5 text-sm light:text-ink">
            {location.avgRating.toFixed(1)}
            <svg viewBox="0 0 24 24" fill="none" stroke="var(--sun-core)" strokeWidth={2} className="h-3.5 w-3.5">
              <polygon points="12 2 15 9 22 9.5 17 14.5 18.5 22 12 18 5.5 22 7 14.5 2 9.5 9 9" />
            </svg>
          </span>
          <span>·</span>
          <span>{pluralize(location.ratingsCount, "avaliação", "avaliações")}</span>
          <span>·</span>
          <span>{pluralize(location.photosCount, "foto", "fotos")}</span>
        </div>
      </div>
    </Link>
  );
}
