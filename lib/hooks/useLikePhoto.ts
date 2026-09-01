"use client";

import { useState } from "react";
import { likePhoto, unlikePhoto } from "@/lib/api/photos";
import { useAuth } from "@/lib/hooks/useAuth";

export function useLikePhoto(photoId: string, initialLiked: boolean, initialCount: number) {
  const { token } = useAuth();
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);

  const toggle = async () => {
    if (!token) return;

    const next = !liked;
    setLiked(next);
    setCount((c) => c + (next ? 1 : -1));

    try {
      await (next ? likePhoto : unlikePhoto)(photoId, token);
    } catch {
      setLiked(!next);
      setCount((c) => c + (next ? -1 : 1));
    }
  };

  return { liked, count, toggle };
}
