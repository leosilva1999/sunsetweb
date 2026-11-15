"use client";

import { useEffect, useState } from "react";
import Tabs from "@/components/ui/Tabs";
import PhotoGrid from "@/components/photo/PhotoGrid";
import FollowingFeed from "@/components/photo/FollowingFeed";
import { hasStoredAuth, useAuth } from "@/lib/hooks/useAuth";
import { usePhotoFeed } from "@/lib/hooks/usePhotoFeed";
import type { Photo } from "@/types/photo";
import type { CursorPage } from "@/types/pagination";

const RECENT_TAB = "Recentes";
const TOP_TAB = "Mais curtidas";
const FOLLOWING_TAB = "Seguindo";

const TAB_SORT: Record<string, "recent" | "top"> = { [RECENT_TAB]: "recent", [TOP_TAB]: "top" };
const SORT_TAB = { recent: RECENT_TAB, top: TOP_TAB } as const;

// /photos?feed=following abre direto a aba "Seguindo" (só vale pra quem está logado).
const FEED_PARAM = "feed";
const FOLLOWING_VALUE = "following";

function setFeedParam(following: boolean) {
  const url = new URL(window.location.href);
  if (following) url.searchParams.set(FEED_PARAM, FOLLOWING_VALUE);
  else url.searchParams.delete(FEED_PARAM);
  window.history.replaceState(window.history.state, "", url);
}

interface PhotoFeedProps {
  initialSort: "recent" | "top";
  initialPage: CursorPage<Photo>;
}

export default function PhotoFeed({ initialSort, initialPage }: PhotoFeedProps) {
  const { sort, photos, hasMore, isLoadingMore, isChangingSort, loadMore, changeSort } = usePhotoFeed(
    initialSort,
    initialPage,
  );
  const { isAuthenticated } = useAuth();
  const [followingSelected, setFollowingSelected] = useState(false);

  // A página é estática (ISR), então o parâmetro só pode ser lido no navegador, depois da hidratação.
  useEffect(() => {
    const wantsFollowing = new URLSearchParams(window.location.search).get(FEED_PARAM) === FOLLOWING_VALUE;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (wantsFollowing && hasStoredAuth()) setFollowingSelected(true);
  }, []);

  // Deslogar com a aba aberta volta pras fotos públicas.
  const showFollowing = followingSelected && isAuthenticated;
  const tabs = isAuthenticated ? [RECENT_TAB, TOP_TAB, FOLLOWING_TAB] : [RECENT_TAB, TOP_TAB];

  const handleTabChange = (tab: string) => {
    const following = tab === FOLLOWING_TAB;
    setFollowingSelected(following);
    setFeedParam(following);
    if (!following) changeSort(TAB_SORT[tab]);
  };

  return (
    <div>
      <Tabs options={tabs} active={showFollowing ? FOLLOWING_TAB : SORT_TAB[sort]} onChange={handleTabChange} />
      {showFollowing ? (
        <FollowingFeed />
      ) : (
        <>
          {photos.length === 0 ? (
            <p className="text-sm text-cream-dim opacity-70 light:text-ink-dim light:opacity-100">
              {isChangingSort ? "Carregando..." : "Ainda não há fotos por aqui."}
            </p>
          ) : (
            <PhotoGrid items={photos} showAds />
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
        </>
      )}
    </div>
  );
}
