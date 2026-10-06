"use client";

import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/lib/hooks/useAuth";
import FollowButton from "@/components/profile/FollowButton";

interface PhotoAuthorProps {
  userId: string;
  userName: string;
  userAvatarUrl: string | null;
}

export default function PhotoAuthor({ userId, userName, userAvatarUrl }: PhotoAuthorProps) {
  const { user } = useAuth();
  const isOwnPhoto = user?.id === userId;

  return (
    <div className="mb-4 flex items-center justify-between gap-3">
      <Link href={`/profile/${userId}`} className="flex items-center gap-2.5 hover:opacity-80">
        {userAvatarUrl ? (
          // unoptimized: avatarUrl é uma URL arbitrária que o próprio usuário escolhe
          // (ver EditProfileModal) - não dá pra colocar todo host possível em
          // remotePatterns, e permitir qualquer host lá seria abrir um proxy de
          // imagens pro servidor buscar URLs arbitrárias de terceiros.
          <Image src={userAvatarUrl} alt="" width={36} height={36} unoptimized className="h-9 w-9 rounded-full object-cover" />
        ) : (
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-cream/15 font-mono text-sm light:bg-ink/10">
            {userName.charAt(0).toUpperCase()}
          </span>
        )}
        <span className="font-medium">{userName}</span>
      </Link>
      {!isOwnPhoto && (
        // isFollowedByCurrentUser real só é resolvido com o token (client-side) - o fetch
        // inicial da página é server-side e sempre anônimo, mesmo limite já aceito em
        // likedByCurrentUser (LikeButton) e no ProfileHeader.
        <FollowButton userId={userId} initialFollowing={false} />
      )}
    </div>
  );
}
