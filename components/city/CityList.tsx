"use client";

import CityCard from "@/components/city/CityCard";
import LoadMoreButton from "@/components/ui/LoadMoreButton";
import { searchCities } from "@/lib/api/cities";
import { useCursorPage } from "@/lib/hooks/useCursorPage";
import type { City } from "@/types/city";
import type { CursorPage } from "@/types/pagination";

interface CityListProps {
  initialPage: CursorPage<City>;
  pageSize: number;
}

// Índice de cidades: só as que têm locais, mais locais primeiro (o padrão da API).
export default function CityList({ initialPage, pageSize }: CityListProps) {
  const { items, hasMore, isLoadingMore, loadError, loadMore } = useCursorPage(initialPage, (cursor) =>
    searchCities({ cursor, limit: pageSize }),
  );

  return (
    <div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((city) => (
          <CityCard key={city.id} city={city} />
        ))}
      </div>
      <LoadMoreButton hasMore={hasMore} isLoading={isLoadingMore} hasError={loadError} onClick={loadMore} />
    </div>
  );
}
