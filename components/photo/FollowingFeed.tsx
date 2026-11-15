"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import PhotoGrid from "@/components/photo/PhotoGrid";
import LoadMoreButton from "@/components/ui/LoadMoreButton";
import { getUser } from "@/lib/api/auth";
import { getFollowingPhotos } from "@/lib/api/photos";
import { useAuth } from "@/lib/hooks/useAuth";
import type { Photo } from "@/types/photo";

type Status = "loading" | "ready" | "error" | "unauthenticated";

const EMPTY_TEXT = "text-sm text-cream-dim opacity-70 light:text-ink-dim light:opacity-100";

// Aba "Seguindo". Montada só enquanto a aba está aberta: cada vez que o usuário volta pra ela
// a lista é buscada de novo, já refletindo quem ele passou a seguir ou deixou de seguir.
export default function FollowingFeed() {
  const { user, getAccessToken } = useAuth();
  const userId = user?.id;
  const [status, setStatus] = useState<Status>("loading");
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [followingCount, setFollowingCount] = useState<number | null>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [loadMoreError, setLoadMoreError] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    // Ignora a resposta de uma busca já substituída (nova tentativa ou aba fechada).
    let cancelled = false;
    (async () => {
      try {
        const token = await getAccessToken();
        if (!token) {
          if (!cancelled) setStatus("unauthenticated");
          return;
        }
        const page = await getFollowingPhotos(token);
        if (cancelled) return;
        setPhotos(page.items);
        setCursor(page.nextCursor);
        setHasMore(page.hasMore);
        setStatus("ready");

        // Lista vazia: o perfil do próprio usuário diz se é "não segue ninguém" ou "ninguém postou".
        if (page.items.length === 0 && userId) {
          const profile = await getUser(userId, token).catch(() => null);
          if (!cancelled && profile) setFollowingCount(profile.followingCount);
        }
      } catch {
        if (!cancelled) setStatus("error");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [getAccessToken, userId, attempt]);

  const loadMore = useCallback(async () => {
    if (!cursor || isLoadingMore) return;
    setIsLoadingMore(true);
    setLoadMoreError(false);
    try {
      const token = await getAccessToken();
      if (!token) throw new Error("not authenticated");
      const page = await getFollowingPhotos(token, cursor);
      setPhotos((prev) => [...prev, ...page.items]);
      setCursor(page.nextCursor);
      setHasMore(page.hasMore);
    } catch {
      setLoadMoreError(true);
    } finally {
      setIsLoadingMore(false);
    }
  }, [cursor, isLoadingMore, getAccessToken]);

  if (status === "loading") return <p className={EMPTY_TEXT}>Carregando...</p>;

  if (status === "unauthenticated") {
    return (
      <p className={EMPTY_TEXT}>
        Sua sessão expirou.{" "}
        <Link href="/login" className="font-medium text-sun-mid underline light:text-sun-deep">
          Entre de novo
        </Link>{" "}
        para ver as fotos de quem você segue.
      </p>
    );
  }

  if (status === "error") {
    return (
      <div className={EMPTY_TEXT}>
        <p>Não foi possível carregar as fotos de quem você segue.</p>
        <button
          type="button"
          onClick={() => {
            setStatus("loading");
            setAttempt((n) => n + 1);
          }}
          className="mt-2 font-medium text-sun-mid hover:opacity-80 light:text-sun-deep"
        >
          Tentar de novo
        </button>
      </div>
    );
  }

  if (photos.length === 0) {
    return followingCount === 0 ? (
      <p className={EMPTY_TEXT}>
        Você ainda não segue ninguém. Siga fotógrafos para ver as fotos deles aqui — comece pelo{" "}
        <Link href="/ranking" className="font-medium text-sun-mid underline light:text-sun-deep">
          ranking de locais
        </Link>
        .
      </p>
    ) : (
      <p className={EMPTY_TEXT}>As pessoas que você segue ainda não postaram fotos.</p>
    );
  }

  return (
    <>
      <PhotoGrid items={photos} showAds />
      <LoadMoreButton hasMore={hasMore} isLoading={isLoadingMore} hasError={loadMoreError} onClick={loadMore} />
    </>
  );
}
