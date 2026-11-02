import Link from "next/link";
import { cityPath, cityPlaceLabel } from "@/lib/utils/cityPath";
import { pluralize } from "@/lib/utils/pluralize";
import type { CityRankingItem } from "@/types/city";

export default function CityRankingList({ items }: { items: CityRankingItem[] }) {
  return (
    <ol className="flex flex-col gap-0.5 light:gap-2.5">
      {items.map(({ city, periodAvgRating, periodRatingsCount }, index) => (
        <li key={city.id}>
          <Link
            href={cityPath(city)}
            className="grid grid-cols-[56px_1fr_auto] items-center gap-6 rounded-2xl p-4.5 transition-colors hover:bg-white/4 max-md:grid-cols-[40px_1fr_auto] light:bg-card light:shadow-[0_2px_10px_rgba(74,43,99,0.05)] light:hover:bg-card light:hover:shadow-[0_8px_24px_rgba(74,43,99,0.1)]"
          >
            <span
              className={`font-mono text-[1.3rem] ${index === 0 ? "text-sun-core text-[1.6rem] light:text-sun-deep" : "text-sun-mid opacity-80"}`}
            >
              {String(index + 1).padStart(2, "0")}
            </span>
            <div>
              <h3 className="mb-1 font-display text-[1.15rem] font-medium">{city.name}</h3>
              <span className="font-mono text-[0.76rem] text-cream-dim opacity-60 light:text-ink-dim light:opacity-100">
                {cityPlaceLabel(city)} · {pluralize(city.locationsCount, "local", "locais")}
              </span>
            </div>
            <div className="text-right font-mono text-sm text-cream-dim light:text-ink">
              {periodAvgRating.toFixed(1)} ★
              <span className="block text-xs opacity-70">{pluralize(periodRatingsCount, "avaliação", "avaliações")}</span>
            </div>
          </Link>
        </li>
      ))}
    </ol>
  );
}
