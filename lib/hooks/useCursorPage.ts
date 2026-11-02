"use client";

import { useState } from "react";
import type { CursorPage } from "@/types/pagination";

// "Carregar mais" de uma listagem paginada por cursor: parte da primeira página (já buscada no
// servidor) e guarda o cursor da próxima, nunca um número de página.
export function useCursorPage<T>(initialPage: CursorPage<T>, fetchPage: (cursor: string) => Promise<CursorPage<T>>) {
  const [items, setItems] = useState(initialPage.items);
  const [cursor, setCursor] = useState(initialPage.nextCursor);
  const [hasMore, setHasMore] = useState(initialPage.hasMore);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [loadError, setLoadError] = useState(false);

  const loadMore = async () => {
    if (!cursor || isLoadingMore) return;

    setIsLoadingMore(true);
    setLoadError(false);
    try {
      const page = await fetchPage(cursor);
      setItems((prev) => [...prev, ...page.items]);
      setCursor(page.nextCursor);
      setHasMore(page.hasMore);
    } catch {
      setLoadError(true);
    } finally {
      setIsLoadingMore(false);
    }
  };

  return { items, hasMore, isLoadingMore, loadError, loadMore };
}
