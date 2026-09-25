"use client";

import { useRef, useState } from "react";
import { createComment, deleteComment, getCommentReplies, getPhotoComments } from "@/lib/api/photos";
import { useAuth } from "@/lib/hooks/useAuth";
import type { Comment } from "@/types/comment";
import type { CursorPage } from "@/types/pagination";

export interface RepliesState {
  items: Comment[];
  cursor: string | null;
  hasMore: boolean;
  isLoadingMore: boolean;
}

export function useComments(photoId: string, initialPage: CursorPage<Comment>) {
  const { user, getAccessToken } = useAuth();
  const [comments, setComments] = useState(initialPage.items);
  const [cursor, setCursor] = useState(initialPage.nextCursor);
  const [hasMore, setHasMore] = useState(initialPage.hasMore);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [repliesByCommentId, setRepliesByCommentId] = useState<Record<string, RepliesState>>({});
  const [loadingReplyIds, setLoadingReplyIds] = useState<Set<string>>(new Set());
  // Contador local em vez de Date.now() — id só precisa ser único dentro desta sessão
  // do hook até o servidor responder com o id real.
  const nextTempId = useRef(0);
  const makeTempId = () => `temp-${nextTempId.current++}`;

  const bumpRepliesCount = (commentId: string, delta: number) => {
    setComments((prev) =>
      prev.map((comment) =>
        comment.id === commentId
          ? { ...comment, repliesCount: Math.max(0, comment.repliesCount + delta) }
          : comment,
      ),
    );
  };

  const post = async (content: string) => {
    const token = await getAccessToken();
    if (!token || !user) throw new Error("not authenticated");

    const tempId = makeTempId();
    const optimistic: Comment = {
      id: tempId,
      photoId,
      userId: user.id,
      userName: user.name,
      userAvatarUrl: user.avatarUrl,
      content,
      createdAt: new Date().toISOString(),
      parentCommentId: null,
      repliesCount: 0,
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

  // Se as respostas desse comentário ainda não foram carregadas, busca a página real
  // primeiro — senão a resposta otimista ficaria sozinha na lista, escondendo as que
  // já existiam no servidor (e "hasMore" mentiria que não há mais nada a carregar).
  const postReply = async (parentCommentId: string, content: string) => {
    const tempId = makeTempId();
    const token = await getAccessToken();
    if (!token || !user) throw new Error("not authenticated");

    if (!repliesByCommentId[parentCommentId]) {
      await toggleReplies(parentCommentId);
    }

    const optimistic: Comment = {
      id: tempId,
      photoId,
      userId: user.id,
      userName: user.name,
      userAvatarUrl: user.avatarUrl,
      content,
      createdAt: new Date().toISOString(),
      parentCommentId,
      repliesCount: 0,
    };

    setRepliesByCommentId((prev) => {
      const existing = prev[parentCommentId] ?? { items: [], cursor: null, hasMore: false, isLoadingMore: false };
      return { ...prev, [parentCommentId]: { ...existing, items: [...existing.items, optimistic] } };
    });
    bumpRepliesCount(parentCommentId, 1);

    try {
      const created = await createComment(photoId, content, token, parentCommentId);
      setRepliesByCommentId((prev) => {
        const existing = prev[parentCommentId];
        if (!existing) return prev;
        return {
          ...prev,
          [parentCommentId]: { ...existing, items: existing.items.map((reply) => (reply.id === tempId ? created : reply)) },
        };
      });
    } catch (err) {
      setRepliesByCommentId((prev) => {
        const existing = prev[parentCommentId];
        if (!existing) return prev;
        return { ...prev, [parentCommentId]: { ...existing, items: existing.items.filter((reply) => reply.id !== tempId) } };
      });
      bumpRepliesCount(parentCommentId, -1);
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
      // Exclusão em cascata no servidor — descarta o cache local de respostas junto.
      setRepliesByCommentId((prev) => {
        if (!(commentId in prev)) return prev;
        const next = { ...prev };
        delete next[commentId];
        return next;
      });
    } catch {
      setComments((prev) => {
        const next = [...prev];
        next.splice(index, 0, removed);
        return next;
      });
    }
  };

  const removeReply = async (parentCommentId: string, replyId: string) => {
    const token = await getAccessToken();
    if (!token) return;

    const existing = repliesByCommentId[parentCommentId];
    if (!existing) return;
    const index = existing.items.findIndex((reply) => reply.id === replyId);
    const removed = existing.items[index];
    if (!removed) return;

    setRepliesByCommentId((prev) => ({
      ...prev,
      [parentCommentId]: { ...existing, items: existing.items.filter((reply) => reply.id !== replyId) },
    }));
    bumpRepliesCount(parentCommentId, -1);

    try {
      await deleteComment(replyId, token);
    } catch {
      setRepliesByCommentId((prev) => {
        const current = prev[parentCommentId] ?? existing;
        const nextItems = [...current.items];
        nextItems.splice(index, 0, removed);
        return { ...prev, [parentCommentId]: { ...current, items: nextItems } };
      });
      bumpRepliesCount(parentCommentId, 1);
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

  // Alterna entre carregar (na primeira vez) e esconder as respostas de um comentário.
  // A chave existir em `repliesByCommentId` é o que marca o painel como expandido.
  const toggleReplies = async (commentId: string) => {
    if (repliesByCommentId[commentId]) {
      setRepliesByCommentId((prev) => {
        const next = { ...prev };
        delete next[commentId];
        return next;
      });
      return;
    }

    setLoadingReplyIds((prev) => new Set(prev).add(commentId));
    try {
      const page = await getCommentReplies(commentId);
      setRepliesByCommentId((prev) => ({
        ...prev,
        [commentId]: { items: page.items, cursor: page.nextCursor, hasMore: page.hasMore, isLoadingMore: false },
      }));
    } finally {
      setLoadingReplyIds((prev) => {
        const next = new Set(prev);
        next.delete(commentId);
        return next;
      });
    }
  };

  const loadMoreReplies = async (commentId: string) => {
    const existing = repliesByCommentId[commentId];
    if (!existing || !existing.cursor || existing.isLoadingMore) return;

    setRepliesByCommentId((prev) => ({ ...prev, [commentId]: { ...existing, isLoadingMore: true } }));
    try {
      const page = await getCommentReplies(commentId, existing.cursor);
      setRepliesByCommentId((prev) => {
        const current = prev[commentId];
        if (!current) return prev;
        return {
          ...prev,
          [commentId]: {
            items: [...current.items, ...page.items],
            cursor: page.nextCursor,
            hasMore: page.hasMore,
            isLoadingMore: false,
          },
        };
      });
    } catch {
      setRepliesByCommentId((prev) => (prev[commentId] ? { ...prev, [commentId]: { ...prev[commentId], isLoadingMore: false } } : prev));
    }
  };

  return {
    comments,
    hasMore,
    isLoadingMore,
    repliesByCommentId,
    loadingReplyIds,
    post,
    postReply,
    remove,
    removeReply,
    loadMore,
    toggleReplies,
    loadMoreReplies,
  };
}
