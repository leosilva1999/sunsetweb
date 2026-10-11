"use client";

import { useEffect, useRef, useState } from "react";
import { followUser, getUser, unfollowUser } from "@/lib/api/auth";
import { useAuth } from "@/lib/hooks/useAuth";

export function useFollowUser(userId: string, initialFollowing: boolean) {
  const { isAuthenticated, getAccessToken } = useAuth();
  const [following, setFollowing] = useState(initialFollowing);
  // Cliques do usuário vencem a resolução inicial, caso ela chegue depois.
  const touchedRef = useRef(false);

  // O fetch da página é server-side e anônimo, então initialFollowing vem sempre
  // false — o estado real só existe com o token, resolvido aqui no client.
  useEffect(() => {
    if (!isAuthenticated) return;
    let cancelled = false;

    (async () => {
      try {
        const token = await getAccessToken();
        if (!token) return;
        const user = await getUser(userId, token);
        if (!cancelled && !touchedRef.current) setFollowing(user.isFollowedByCurrentUser);
      } catch {
        // Falha aqui só mantém o valor inicial; o botão continua utilizável.
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [userId, isAuthenticated, getAccessToken]);

  const toggle = async () => {
    if (!isAuthenticated) return;

    touchedRef.current = true;
    const next = !following;
    setFollowing(next);

    try {
      const token = await getAccessToken();
      if (!token) throw new Error("not authenticated");
      await (next ? followUser : unfollowUser)(userId, token);
    } catch {
      setFollowing(!next);
    }
  };

  return { following, toggle };
}
