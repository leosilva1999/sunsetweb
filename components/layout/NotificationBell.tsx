"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { getComment } from "@/lib/api/photos";
import { formatDate } from "@/lib/utils/formatDate";
import { useNotifications } from "@/lib/hooks/useNotifications";
import type { Notification, NotificationType } from "@/types/notification";

const MESSAGES: Record<NotificationType, (name: string) => string> = {
  NewFollower: (name) => `${name} começou a seguir você`,
  PhotoLiked: (name) => `${name} curtiu sua foto`,
  PhotoCommented: (name) => `${name} comentou na sua foto`,
  CommentReplied: (name) => `${name} respondeu seu comentário`,
};

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const { unreadCount, notifications, hasMore, isLoading, hasLoaded, loadFirstPage, loadMore, markRead, markAllRead } =
    useNotifications();

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) setIsOpen(false);
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const handleToggle = () => {
    const opening = !isOpen;
    setIsOpen(opening);
    if (opening && !hasLoaded) {
      loadFirstPage();
    }
  };

  const hasUnread = notifications.some((n) => !n.readAt);

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        onClick={handleToggle}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-label="Notificações"
        className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/15 text-cream light:border-ink/15 light:text-ink"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-sun-deep px-1 font-mono text-[0.6rem] font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          role="menu"
          className="absolute top-full right-0 z-20 mt-3 w-80 overflow-hidden rounded-2xl border border-white/10 bg-dusk-900 shadow-[0_12px_40px_rgba(21,10,38,0.35)] light:border-line light:bg-paper"
        >
          <div className="flex items-center justify-between border-b border-white/8 px-4 py-3 light:border-line">
            <span className="text-sm font-semibold">Notificações</span>
            {hasUnread && (
              <button onClick={markAllRead} className="text-xs font-medium text-sun-mid hover:opacity-80 light:text-sun-deep">
                Marcar todas como lidas
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {isLoading && notifications.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-cream-dim opacity-70 light:text-ink-dim light:opacity-100">
                Carregando...
              </p>
            ) : notifications.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-cream-dim opacity-70 light:text-ink-dim light:opacity-100">
                Nenhuma notificação ainda.
              </p>
            ) : (
              <ul>
                {notifications.map((notification) => (
                  <NotificationRow key={notification.id} notification={notification} onRead={markRead} />
                ))}
              </ul>
            )}
            {hasMore && (
              <button
                onClick={loadMore}
                className="w-full px-4 py-3 text-center text-xs font-medium text-sun-mid hover:opacity-80 light:text-sun-deep"
              >
                Carregar mais
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

interface NotificationRowProps {
  notification: Notification;
  onRead: (id: string) => void;
}

// targetDescription resolve direto pra link em User/Photo - pra Comment precisa
// buscar o comentário pra achar o photoId (mesmo padrão do ActionTargetLink em
// ModerationHistory.tsx), já que não existe uma página de comentário isolada.
function NotificationRow({ notification, onRead }: NotificationRowProps) {
  const [prefix, rest] = notification.targetDescription.split(":", 2);
  const [resolvedHref, setResolvedHref] = useState<string | null>(
    prefix === "User" && rest ? `/profile/${rest}` : prefix === "Photo" && rest ? `/photos/${rest}` : null,
  );
  const [resolving, setResolving] = useState(prefix === "Comment");

  useEffect(() => {
    if (prefix !== "Comment" || !rest) return;
    let cancelled = false;
    getComment(rest)
      .then((comment) => {
        if (!cancelled) setResolvedHref(`/photos/${comment.photoId}`);
      })
      .catch(() => {
        // comentário pode ter sido excluído - sem link, só mostra o texto
      })
      .finally(() => {
        if (!cancelled) setResolving(false);
      });
    return () => {
      cancelled = true;
    };
  }, [prefix, rest]);

  const isUnread = !notification.readAt;
  const message = MESSAGES[notification.type](notification.actorName);

  const content = (
    <div className={`flex items-start gap-3 px-4 py-3 hover:bg-white/5 light:hover:bg-black/5 ${isUnread ? "bg-sun-core/5" : ""}`}>
      {notification.actorAvatarUrl ? (
        // unoptimized: avatarUrl é uma URL arbitrária que o próprio usuário escolhe
        // (ver EditProfileModal) - não dá pra colocar todo host possível em
        // remotePatterns, e permitir qualquer host lá seria abrir um proxy de
        // imagens pro servidor buscar URLs arbitrárias de terceiros.
        <Image
          src={notification.actorAvatarUrl}
          alt=""
          width={36}
          height={36}
          unoptimized
          className="h-9 w-9 shrink-0 rounded-full object-cover"
        />
      ) : (
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-cream/15 font-mono text-sm light:bg-ink/10">
          {notification.actorName.charAt(0).toUpperCase()}
        </span>
      )}
      <div className="min-w-0 flex-1">
        <p className="text-sm">{message}</p>
        <p className="mt-0.5 font-mono text-xs text-cream-dim opacity-60 light:text-ink-dim light:opacity-100">
          {formatDate(notification.createdAt)}
        </p>
      </div>
      {isUnread && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-sun-core" aria-hidden />}
    </div>
  );

  if (resolving || !resolvedHref) {
    return <li className={resolving ? "" : "opacity-60"}>{content}</li>;
  }

  return (
    <li>
      <Link href={resolvedHref} onClick={() => isUnread && onRead(notification.id)}>
        {content}
      </Link>
    </li>
  );
}
