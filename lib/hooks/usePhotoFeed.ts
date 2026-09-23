"use client";

import { useState } from "react";
import { getPhotos } from "@/lib/api/photos";
import type { Photo } from "@/types/photo";
import type { CursorPage } from "@/types/pagination";

type Sort = "recent" | "top";

export function usePhotoFeed(initialSort: Sort, initialPage: CursorPage<Photo>) {
  const [sort, setSort] = useState<Sort>(initialSort);
  const [photos, setPhotos] = useState(initialPage.items);
  const [cursor, setCursor] = useState(initialPage.nextCursor);
  const [hasMore, setHasMore] = useState(initialPage.hasMore);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isChangingSort, setIsChangingSort] = useState(false);

  const loadMore = async () => {
    if (!cursor || isLoadingMore) return;

    setIsLoadingMore(true);
    try {
      const page = await getPhotos(sort, cursor);
      setPhotos((prev) => [...prev, ...page.items]);
      setCursor(page.nextCursor);
      setHasMore(page.hasMore);
    } catch {
      // mantém a lista anterior em caso de falha
    } finally {
      setIsLoadingMore(false);
    }
  };

  const changeSort = async (nextSort: Sort) => {
    if (nextSort === sort || isChangingSort) return;

    setSort(nextSort);
    setIsChangingSort(true);
    try {
      const page = await getPhotos(nextSort);
      setPhotos(page.items);
      setCursor(page.nextCursor);
      setHasMore(page.hasMore);
    } catch {
      // mantém a lista anterior em caso de falha
    } finally {
      setIsChangingSort(false);
    }
  };

  return { sort, photos, hasMore, isLoadingMore, isChangingSort, loadMore, changeSort };
}
