"use client";

import Tabs from "@/components/ui/Tabs";
import PhotoGrid from "@/components/photo/PhotoGrid";
import { usePhotoFeed } from "@/lib/hooks/usePhotoFeed";
import type { Photo } from "@/types/photo";
import type { CursorPage } from "@/types/pagination";

const RECENT_TAB = "Recentes";
const TOP_TAB = "Mais curtidas";
const TABS = [RECENT_TAB, TOP_TAB];

const TAB_SORT: Record<string, "recent" | "top"> = { [RECENT_TAB]: "recent", [TOP_TAB]: "top" };
const SORT_TAB = { recent: RECENT_TAB, top: TOP_TAB } as const;

interface PhotoFeedProps {
  initialSort: "recent" | "top";
  initialPage: CursorPage<Photo>;
}

export default function PhotoFeed({ initialSort, initialPage }: PhotoFeedProps) {
  const { sort, photos, hasMore, isLoadingMore, isChangingSort, loadMore, changeSort } = usePhotoFeed(
    initialSort,
    initialPage,
  );

  return (
    <div>
      <Tabs options={TABS} active={SORT_TAB[sort]} onChange={(tab) => changeSort(TAB_SORT[tab])} />
      {photos.length === 0 ? (
        <p className="text-sm text-cream-dim opacity-70 light:text-ink-dim light:opacity-100">
          {isChangingSort ? "Carregando..." : "Ainda não há fotos por aqui."}
        </p>
      ) : (
        <PhotoGrid items={photos.map((photo) => ({ photo, locationName: photo.locationName, city: "" }))} />
      )}
      {hasMore && (
        <button
          onClick={loadMore}
          disabled={isLoadingMore}
          className="mt-6 text-sm font-medium text-sun-mid hover:opacity-80 light:text-sun-deep"
        >
          {isLoadingMore ? "Carregando..." : "Carregar mais"}
        </button>
      )}
    </div>
  );
}
