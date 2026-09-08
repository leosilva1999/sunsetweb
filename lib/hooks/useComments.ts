"use client";

import { useState } from "react";
import { createComment, deleteComment, getPhotoComments } from "@/lib/api/photos";
import { useAuth } from "@/lib/hooks/useAuth";
import type { Comment } from "@/types/comment";
import type { CursorPage } from "@/types/pagination";

export function useComments(photoId: string, initialPage: CursorPage<Comment>) {
  const { user, getAccessToken } = useAuth();
  const [comments, setComments] = useState(initialPage.items);
  const [cursor, setCursor] = useState(initialPage.nextCursor);
  const [hasMore, setHasMore] = useState(initialPage.hasMore);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const post = async (content: string) => {
    const token = await getAccessToken();
    if (!token || !user) throw new Error("not authenticated");

    const tempId = `temp-${Date.now()}`;
    const optimistic: Comment = {
      id: tempId,
      userId: user.id,
      userName: user.name,
      userAvatarUrl: user.avatarUrl,
      content,
      createdAt: new Date().toISOString(),
    };
    setComments((prev) => [optimistic, ...prev]);

    try {
      const created = await createComment(photoId, content, token);
      setComments((prev) => prev.map((comment) => (comment.id === tempId ? created : comment)));
    } catch (err) {
      setComments((prev) => prev.filter((comment) => comment.id !== tempId));
      throw err;
    }
  };

  const remove = async (commentId: string) => {
    const token = await getAccessToken();
    if (!token) return;

    const index = comments.findIndex((comment) => comment.id === commentId);
    const removed = comments[index];
    if (!removed) return;

    setComments((prev) => prev.filter((comment) => comment.id !== commentId));

    try {
      await deleteComment(commentId, token);
    } catch {
      setComments((prev) => {
        const next = [...prev];
        next.splice(index, 0, removed);
        return next;
      });
    }
  };

  const loadMore = async () => {
    if (!cursor || isLoadingMore) return;

    setIsLoadingMore(true);
    try {
      const page = await getPhotoComments(photoId, cursor);
      setComments((prev) => [...prev, ...page.items]);
      setCursor(page.nextCursor);
      setHasMore(page.hasMore);
    } finally {
      setIsLoadingMore(false);
    }
  };

  return { comments, hasMore, isLoadingMore, post, remove, loadMore };
}
