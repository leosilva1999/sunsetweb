"use client";

import LocationCard from "@/components/location/LocationCard";
import LoadMoreButton from "@/components/ui/LoadMoreButton";
import { getCityLocations } from "@/lib/api/cities";
import { useCursorPage } from "@/lib/hooks/useCursorPage";
import type { Location } from "@/types/location";
import type { CursorPage } from "@/types/pagination";

interface CityLocationsProps {
  slug: string;
  initialPage: CursorPage<Location>;
}

// Locais da cidade, melhor avaliados primeiro (o padrão da API).
export default function CityLocations({ slug, initialPage }: CityLocationsProps) {
  const { items, hasMore, isLoadingMore, loadError, loadMore } = useCursorPage(initialPage, (cursor) =>
    getCityLocations(slug, "rating", cursor),
  );

  return (
    <div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((location) => (
          <LocationCard key={location.id} location={location} />
        ))}
      </div>
      <LoadMoreButton hasMore={hasMore} isLoading={isLoadingMore} hasError={loadError} onClick={loadMore} />
    </div>
  );
}
