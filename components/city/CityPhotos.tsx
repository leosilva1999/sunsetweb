"use client";

import PhotoGrid from "@/components/photo/PhotoGrid";
import LoadMoreButton from "@/components/ui/LoadMoreButton";
import { getCityPhotos } from "@/lib/api/cities";
import { useAuth } from "@/lib/hooks/useAuth";
import { useCursorPage } from "@/lib/hooks/useCursorPage";
import type { Photo } from "@/types/photo";
import type { CursorPage } from "@/types/pagination";

interface CityPhotosProps {
  slug: string;
  initialPage: CursorPage<Photo>;
}

// Fotos de todos os locais da cidade numa lista, mais curtidas primeiro (o padrão da API).
export default function CityPhotos({ slug, initialPage }: CityPhotosProps) {
  const { getAccessToken } = useAuth();
  // Com o token, as páginas seguintes já trazem likedByCurrentUser certo; a primeira, vinda do
  // servidor, é anônima e cada PhotoCard resolve o próprio estado (useLikePhoto).
  const { items, hasMore, isLoadingMore, loadError, loadMore } = useCursorPage(initialPage, async (cursor) =>
    getCityPhotos(slug, "top", cursor, undefined, await getAccessToken()),
  );

  return (
    <div>
      <PhotoGrid items={items} />
      <LoadMoreButton hasMore={hasMore} isLoading={isLoadingMore} hasError={loadError} onClick={loadMore} />
    </div>
  );
}
