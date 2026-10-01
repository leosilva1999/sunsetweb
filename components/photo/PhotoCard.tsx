import Image from "next/image";
import Link from "next/link";
import type { Photo } from "@/types/photo";
import LikeButton from "@/components/photo/LikeButton";

interface PhotoCardProps {
  photo: Photo;
  big?: boolean;
}

export default function PhotoCard({ photo, big }: PhotoCardProps) {
  return (
    <Link
      href={`/photos/${photo.id}`}
      className={`group flex flex-col overflow-hidden rounded-2xl border border-white/10 light:border-line light:shadow-[0_2px_10px_rgba(74,43,99,0.05)] ${big ? "col-span-2 row-span-2" : ""}`}
    >
      <div className="relative min-h-0 flex-1 bg-cover bg-center" style={{ backgroundImage: `url(${photo.imageUrl})` }}>
        <LikeButton photoId={photo.id} initialLiked={photo.likedByCurrentUser} initialCount={photo.likesCount} />
      </div>
      <div className="flex items-start justify-between gap-2.5 bg-dusk-900 px-3.5 py-2.5 light:bg-card">
        <div className="flex min-w-0 items-start gap-2">
          {photo.userAvatarUrl ? (
            // unoptimized: avatarUrl é uma URL arbitrária que o próprio usuário escolhe
            // (ver EditProfileModal) - não dá pra colocar todo host possível em
            // remotePatterns, e permitir qualquer host lá seria abrir um proxy de
            // imagens pro servidor buscar URLs arbitrárias de terceiros.
            <Image
              src={photo.userAvatarUrl}
              alt=""
              width={28}
              height={28}
              unoptimized
              className="h-7 w-7 shrink-0 rounded-full object-cover"
            />
          ) : (
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-cream/15 font-mono text-xs light:bg-ink/10">
              {photo.userName.charAt(0).toUpperCase()}
            </span>
          )}
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">
              {photo.userName} em {photo.locationName}, {photo.city}
            </p>
            {photo.caption && (
              <p className="truncate text-xs text-cream-dim opacity-70 light:text-ink-dim light:opacity-100">
                {photo.caption}
              </p>
            )}
          </div>
        </div>
        <div className="flex shrink-0 gap-2.5 pt-0.5 font-mono text-xs text-cream-dim opacity-85 light:text-ink-dim light:opacity-100">
          <span className="flex items-center gap-1">❤ {photo.likesCount}</span>
          <span className="flex items-center gap-1">💬 {photo.commentsCount}</span>
        </div>
      </div>
    </Link>
  );
}
