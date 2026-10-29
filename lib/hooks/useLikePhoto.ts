"use client";

import { useEffect, useRef, useState } from "react";
import { getPhoto, likePhoto, unlikePhoto } from "@/lib/api/photos";
import { useAuth } from "@/lib/hooks/useAuth";
import type { Photo } from "@/types/photo";

// Junta consultas simultâneas da mesma foto (ex.: StrictMode montando o efeito duas vezes).
// Só dura enquanto a requisição está no ar: guardar o resultado seria servir um estado
// velho depois de uma curtida.
const inflight = new Map<string, Promise<Photo>>();

function fetchPhotoState(photoId: string, token: string): Promise<Photo> {
  let request = inflight.get(photoId);
  if (!request) {
    request = getPhoto(photoId, token).finally(() => inflight.delete(photoId));
    inflight.set(photoId, request);
  }
  return request;
}

export function useLikePhoto(photoId: string, initialLiked: boolean, initialCount: number) {
  const { isAuthenticated, getAccessToken } = useAuth();
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  // Espelho síncrono do estado, pra toggle decidir em cima do valor mais recente.
  const likedRef = useRef(initialLiked);
  const resolvedRef = useRef<Promise<void>>(Promise.resolve());
  const busyRef = useRef(false);

  const apply = (nextLiked: boolean, nextCount: (current: number) => number) => {
    likedRef.current = nextLiked;
    setLiked(nextLiked);
    setCount(nextCount);
  };

  // O fetch das páginas é server-side e anônimo, então initialLiked vem sempre false (e a
  // API devolve likedByCurrentUser=false fixo nas listas de fotos por usuário/local). O
  // estado real só existe com o token, resolvido aqui no client. A contagem vem junto: a
  // curtida é idempotente na API, então qualquer soma local feita em cima de um estado
  // errado deixava o número acima do real até a página recarregar.
  useEffect(() => {
    if (!isAuthenticated) return;
    let cancelled = false;

    resolvedRef.current = (async () => {
      try {
        const token = await getAccessToken();
        if (!token) return;
        const photo = await fetchPhotoState(photoId, token);
        if (!cancelled) apply(photo.likedByCurrentUser, () => photo.likesCount);
      } catch {
        // Falha aqui só mantém o valor inicial; o botão continua utilizável.
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [photoId, isAuthenticated, getAccessToken]);

  const toggle = async () => {
    if (!isAuthenticated || busyRef.current) return;
    busyRef.current = true;

    try {
      // Um clique antes da resolução inicial esperaria decidir em cima do estado errado
      // (curtir algo já curtido = no-op no servidor, mas +1 local).
      await resolvedRef.current;

      const next = !likedRef.current;
      apply(next, (c) => c + (next ? 1 : -1));

      try {
        const token = await getAccessToken();
        if (!token) throw new Error("not authenticated");
        await (next ? likePhoto : unlikePhoto)(photoId, token);
      } catch {
        apply(!next, (c) => c + (next ? -1 : 1));
      }
    } finally {
      busyRef.current = false;
    }
  };

  return { liked, count, toggle };
}
