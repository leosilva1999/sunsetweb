"use client";

import { Fragment } from "react";
import InFeedAd from "@/components/ads/InFeedAd";
import LocationCard from "@/components/location/LocationCard";
import LoadMoreButton from "@/components/ui/LoadMoreButton";
import { getCityLocations } from "@/lib/api/cities";
import { useCursorPage } from "@/lib/hooks/useCursorPage";
import type { Location } from "@/types/location";
import type { CursorPage } from "@/types/pagination";

// Um anúncio a cada 6 locais (duas linhas de 3 colunas), em linha própria.
const AD_INTERVAL = 6;

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
        {items.map((location, index) => (
          <Fragment key={location.id}>
            <LocationCard location={location} />
            {(index + 1) % AD_INTERVAL === 0 && (
              <div className="col-span-full empty:hidden">
                <InFeedAd />
              </div>
            )}
          </Fragment>
        ))}
      </div>
      <LoadMoreButton hasMore={hasMore} isLoading={isLoadingMore} hasError={loadError} onClick={loadMore} />
    </div>
  );
}
