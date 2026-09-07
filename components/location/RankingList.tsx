import Link from "next/link";
import type { Location } from "@/types/location";
import { formatCoordinates } from "@/lib/utils/geolocation";

const THUMB_GRADIENTS = [
  "linear-gradient(135deg,#ff8c5a,#e85d8a)",
  "linear-gradient(135deg,#4a2b63,#ff5d6c)",
  "linear-gradient(135deg,#ffcf6b,#ff5d6c)",
  "linear-gradient(135deg,#2d1b4e,#ff8c5a)",
];

interface RankingListProps {
  locations: Location[];
}

export default function RankingList({ locations }: RankingListProps) {
  return (
    <div className="flex flex-col gap-0.5 light:gap-2.5">
      {locations.map((location, index) => (
        <Link
          key={location.id}
          href={`/locations/${location.id}`}
          className="grid grid-cols-[56px_90px_1fr_auto] items-center gap-6 rounded-2xl p-4.5 transition-colors hover:bg-white/4 max-md:grid-cols-[40px_70px_1fr] light:bg-card light:shadow-[0_2px_10px_rgba(74,43,99,0.05)] light:hover:bg-card light:hover:shadow-[0_8px_24px_rgba(74,43,99,0.1)]"
        >
          <span
            className={`font-mono text-[1.3rem] ${index === 0 ? "text-sun-core text-[1.6rem] light:text-sun-deep" : "text-sun-mid opacity-80"}`}
          >
            {String(index + 1).padStart(2, "0")}
          </span>
          <div
            className="h-16 w-[90px] rounded-[10px] bg-cover bg-center"
            style={{ backgroundImage: THUMB_GRADIENTS[index % THUMB_GRADIENTS.length] }}
          />
          <div>
            <h3 className="mb-1 font-display text-[1.15rem] font-medium">{location.name}</h3>
            <span className="font-mono text-[0.76rem] text-cream-dim opacity-60 light:text-ink-dim light:opacity-100">
              {formatCoordinates({ lat: location.latitude, lng: location.longitude })} · {location.city}
            </span>
          </div>
          <div className="flex items-center gap-2 font-mono text-sm text-cream-dim max-md:hidden light:text-ink">
            {location.avgRating.toFixed(1)}
            <svg viewBox="0 0 24 24" fill="none" stroke="var(--sun-core)" strokeWidth={2} className="h-4 w-4">
              <polygon points="12 2 15 9 22 9.5 17 14.5 18.5 22 12 18 5.5 22 7 14.5 2 9.5 9 9" />
            </svg>
          </div>
        </Link>
      ))}
    </div>
  );
}
