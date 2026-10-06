"use client";

import Image from "next/image";
import Link from "next/link";
import { useUserConnections } from "@/lib/hooks/useUserConnections";
import type { PublicUser } from "@/types/user";
import type { CursorPage } from "@/types/pagination";

interface UserListProps {
  userId: string;
  kind: "followers" | "following";
  initialPage: CursorPage<PublicUser>;
  emptyMessage: string;
}

// Sem botão de seguir nas linhas de propósito: a API documenta que
// isFollowedByCurrentUser vem sempre false nesses dois listings (não resolvido pro
// caller), então um FollowButton aqui mentiria "Seguir" até pra quem você já segue.
export default function UserList({ userId, kind, initialPage, emptyMessage }: UserListProps) {
  const { users, hasMore, isLoadingMore, loadMore } = useUserConnections(userId, kind, initialPage);

  if (users.length === 0) {
    return (
      <p className="text-sm text-cream-dim opacity-70 light:text-ink-dim light:opacity-100">{emptyMessage}</p>
    );
  }

  return (
    <div>
      <ul className="flex flex-col gap-1">
        {users.map((u) => (
          <li key={u.id}>
            <Link
              href={`/profile/${u.id}`}
              className="flex items-center gap-3 rounded-2xl px-2 py-3 hover:bg-white/5 light:hover:bg-black/5"
            >
              {u.avatarUrl ? (
                // unoptimized: avatarUrl é uma URL arbitrária que o próprio usuário escolhe
                // (ver EditProfileModal) - não dá pra colocar todo host possível em
                // remotePatterns, e permitir qualquer host lá seria abrir um proxy de
                // imagens pro servidor buscar URLs arbitrárias de terceiros.
                <Image
                  src={u.avatarUrl}
                  alt=""
                  width={44}
                  height={44}
                  unoptimized
                  className="h-11 w-11 shrink-0 rounded-full object-cover"
                />
              ) : (
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-cream/15 font-display text-lg light:bg-ink/10">
                  {u.name.charAt(0).toUpperCase()}
                </span>
              )}
              <div className="min-w-0">
                <p className="truncate font-medium">{u.name}</p>
                {u.bio && (
                  <p className="truncate text-sm text-cream-dim opacity-70 light:text-ink-dim light:opacity-100">{u.bio}</p>
                )}
              </div>
            </Link>
          </li>
        ))}
      </ul>
      {hasMore && (
        <button
          onClick={loadMore}
          disabled={isLoadingMore}
          className="mt-6 text-sm font-medium text-sun-mid hover:opacity-80 light:text-sun-deep"
        >
          {isLoadingMore ? "Carregando..." : "Carregar mais"}
        </button>
      )}
    </div>
  );
}
