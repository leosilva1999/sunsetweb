import Link from "next/link";
import type { Location } from "@/types/location";

interface LocationCardProps {
  location: Location;
}

export default function LocationCard({ location }: LocationCardProps) {
  return (
    <Link
      href={`/locations/${location.id}`}
      className="block rounded-2xl border border-white/10 p-5 transition-colors hover:border-white/30 light:border-line light:bg-card light:shadow-[0_2px_10px_rgba(74,43,99,0.05)] light:hover:border-line"
    >
      <h3 className="font-display text-lg font-medium">{location.name}</h3>
      <p className="mt-1 font-mono text-xs text-cream-dim opacity-70 light:text-ink-dim light:opacity-100">{location.city}</p>
      <div className="mt-3 flex items-center gap-1.5 font-mono text-sm text-cream-dim light:text-ink">
        {location.avgRating.toFixed(1)}
        <svg viewBox="0 0 24 24" fill="none" stroke="var(--sun-core)" strokeWidth={2} className="h-3.5 w-3.5">
          <polygon points="12 2 15 9 22 9.5 17 14.5 18.5 22 12 18 5.5 22 7 14.5 2 9.5 9 9" />
        </svg>
      </div>
    </Link>
  );
}
