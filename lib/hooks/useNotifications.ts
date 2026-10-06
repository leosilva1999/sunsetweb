"use client";

import { useCallback, useEffect, useState } from "react";
import {
  getNotifications,
  getUnreadNotificationCount,
  markAllNotificationsRead,
  markNotificationRead,
} from "@/lib/api/notifications";
import { useAuth } from "@/lib/hooks/useAuth";
import type { Notification } from "@/types/notification";

// Não existe WebSocket/SignalR pro sino (ver docs/API.md) - é polling por design,
// então 45s é um intervalo razoável: frequente o bastante pra parecer "ao vivo" sem
// martelar a API toda hora.
const POLL_INTERVAL_MS = 45_000;

export function useNotifications() {
  const { isAuthenticated, getAccessToken } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) return;

    let cancelled = false;
    const poll = async () => {
      try {
        const token = await getAccessToken();
        if (!token || cancelled) return;
        const { count } = await getUnreadNotificationCount(token);
        if (!cancelled) setUnreadCount(count);
      } catch {
        // mantém o valor anterior em caso de falha - a próxima poll tenta de novo
      }
    };

    poll();
    const interval = setInterval(poll, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [isAuthenticated, getAccessToken]);

  const loadFirstPage = useCallback(async () => {
    setIsLoading(true);
    try {
      const token = await getAccessToken();
      if (!token) return;
      const page = await getNotifications(token);
      setNotifications(page.items);
      setCursor(page.nextCursor);
      setHasMore(page.hasMore);
      setHasLoaded(true);
    } finally {
      setIsLoading(false);
    }
  }, [getAccessToken]);

  const loadMore = useCallback(async () => {
    if (!cursor) return;
    const token = await getAccessToken();
    if (!token) return;
    const page = await getNotifications(token, cursor);
    setNotifications((prev) => [...prev, ...page.items]);
    setCursor(page.nextCursor);
    setHasMore(page.hasMore);
  }, [cursor, getAccessToken]);

  const markRead = useCallback(
    async (id: string) => {
      setNotifications((prev) =>
        prev.map((n) => (n.id === id && !n.readAt ? { ...n, readAt: new Date().toISOString() } : n)),
      );
      setUnreadCount((c) => Math.max(0, c - 1));
      try {
        const token = await getAccessToken();
        if (!token) return;
        await markNotificationRead(id, token);
      } catch {
        // sem rollback - marcar como lida de novo depois é inofensivo (idempotente)
      }
    },
    [getAccessToken],
  );

  const markAllRead = useCallback(async () => {
    setNotifications((prev) => prev.map((n) => (n.readAt ? n : { ...n, readAt: new Date().toISOString() })));
    setUnreadCount(0);
    try {
      const token = await getAccessToken();
      if (!token) return;
      await markAllNotificationsRead(token);
    } catch {
      // sem rollback - a próxima poll de unread-count corrige o badge se isso falhou
    }
  }, [getAccessToken]);

  return {
    // Derivado, não resetado via effect: isAuthenticated vira false (logout) sem
    // esperar a próxima renderização pra esconder o badge de quem saiu.
    unreadCount: isAuthenticated ? unreadCount : 0,
    notifications,
    hasMore,
    isLoading,
    hasLoaded,
    loadFirstPage,
    loadMore,
    markRead,
    markAllRead,
  };
}
