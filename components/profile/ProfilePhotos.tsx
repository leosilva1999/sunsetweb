"use client";

import PhotoGrid from "@/components/photo/PhotoGrid";
import { useUserPhotos } from "@/lib/hooks/useUserPhotos";
import type { Photo } from "@/types/photo";
import type { CursorPage } from "@/types/pagination";

interface ProfilePhotosProps {
  userId: string;
  initialPage: CursorPage<Photo>;
}

export default function ProfilePhotos({ userId, initialPage }: ProfilePhotosProps) {
  const { photos, hasMore, isLoadingMore, loadMore } = useUserPhotos(userId, initialPage);

  if (photos.length === 0) {
    return (
      <p className="text-sm text-cream-dim opacity-70 light:text-ink-dim light:opacity-100">
        Este usuário ainda não postou fotos.
      </p>
    );
  }

  return (
    <div>
      <PhotoGrid
        items={photos.map((photo) => ({
          photo,
          locationName: photo.locationName,
          city: "",
        }))}
      />
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
