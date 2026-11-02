import Link from "next/link";
import PhotoImage from "@/components/photo/PhotoImage";
import { cityPath, cityPlaceLabel } from "@/lib/utils/cityPath";
import { pluralize } from "@/lib/utils/pluralize";
import type { City } from "@/types/city";

export default function CityCard({ city }: { city: City }) {
  return (
    <Link
      href={cityPath(city)}
      className="group block overflow-hidden rounded-2xl border border-white/10 transition-colors hover:border-white/30 light:border-line light:bg-card light:shadow-[0_2px_10px_rgba(74,43,99,0.05)]"
    >
      <div className="relative aspect-4/3 overflow-hidden bg-linear-to-br from-sun-mid/40 to-dusk-700">
        {city.coverImageUrl && (
          <PhotoImage
            src={city.coverImageUrl}
            alt={`Pôr do sol em ${city.name}, ${city.state}`}
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 100vw"
          />
        )}
      </div>
      <div className="p-4">
        <h3 className="font-display text-lg font-medium">{city.name}</h3>
        <p className="mt-0.5 font-mono text-xs text-cream-dim opacity-70 light:text-ink-dim light:opacity-100">
          {cityPlaceLabel(city)}
        </p>
        <p className="mt-3 flex items-center gap-2 font-mono text-xs text-cream-dim light:text-ink-dim">
          <span>{pluralize(city.locationsCount, "local", "locais")}</span>
          <span>·</span>
          <span>{pluralize(city.photosCount, "foto", "fotos")}</span>
          {city.avgRating !== null && (
            <>
              <span>·</span>
              <span className="flex items-center gap-1">
                {city.avgRating.toFixed(1)}
                <svg viewBox="0 0 24 24" fill="none" stroke="var(--sun-core)" strokeWidth={2} className="h-3 w-3">
                  <polygon points="12 2 15 9 22 9.5 17 14.5 18.5 22 12 18 5.5 22 7 14.5 2 9.5 9 9" />
                </svg>
              </span>
            </>
          )}
        </p>
      </div>
    </Link>
  );
}
