import Link from "next/link";
import type { Photo } from "@/types/photo";
import LikeButton from "@/components/photo/LikeButton";

interface PhotoCardProps {
  photo: Photo;
  locationName: string;
  city: string;
  big?: boolean;
}

export default function PhotoCard({ photo, locationName, city, big }: PhotoCardProps) {
  return (
    <Link
      href={`/photos/${photo.id}`}
      className={`group flex flex-col overflow-hidden rounded-2xl border border-white/10 light:border-line light:shadow-[0_2px_10px_rgba(74,43,99,0.05)] ${big ? "col-span-2 row-span-2" : ""}`}
    >
      <div className="relative min-h-0 flex-1 bg-cover bg-center" style={{ backgroundImage: `url(${photo.imageUrl})` }}>
        <LikeButton photoId={photo.id} initialLiked={photo.likedByCurrentUser} initialCount={photo.likesCount} />
      </div>
      <div className="flex items-center justify-between gap-2.5 bg-dusk-900 px-3.5 py-2.5 light:bg-card">
        <div className="min-w-0 truncate font-display text-sm font-medium">
          {locationName}
          <small className="mt-0.5 block truncate font-mono text-[0.65rem] font-normal text-cream-dim opacity-70 light:text-ink-dim light:opacity-100">
            {city}
          </small>
        </div>
        <div className="flex shrink-0 gap-2.5 font-mono text-xs text-cream-dim opacity-85 light:text-ink-dim light:opacity-100">
          <span className="flex items-center gap-1">❤ {photo.likesCount}</span>
          <span className="flex items-center gap-1">💬 {photo.commentsCount}</span>
        </div>
      </div>
    </Link>
  );
}
