"use client";

import { useState } from "react";
import { getUserPhotos } from "@/lib/api/auth";
import type { Photo } from "@/types/photo";
import type { CursorPage } from "@/types/pagination";

export function useUserPhotos(userId: string, initialPage: CursorPage<Photo>) {
  const [photos, setPhotos] = useState(initialPage.items);
  const [cursor, setCursor] = useState(initialPage.nextCursor);
  const [hasMore, setHasMore] = useState(initialPage.hasMore);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const loadMore = async () => {
    if (!cursor || isLoadingMore) return;

    setIsLoadingMore(true);
    try {
      const page = await getUserPhotos(userId, cursor);
      setPhotos((prev) => [...prev, ...page.items]);
      setCursor(page.nextCursor);
      setHasMore(page.hasMore);
    } finally {
      setIsLoadingMore(false);
    }
  };

  return { photos, hasMore, isLoadingMore, loadMore };
}
