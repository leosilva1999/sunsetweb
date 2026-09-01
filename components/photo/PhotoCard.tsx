import Link from "next/link";
import type { Photo } from "@/types/photo";
import LikeButton from "@/components/photo/LikeButton";

interface PhotoCardProps {
  photo: Photo;
  locationName: string;
  city: string;
  commentsCount?: number;
  big?: boolean;
}

export default function PhotoCard({ photo, locationName, city, commentsCount, big }: PhotoCardProps) {
  return (
    <Link
      href={`/photos/${photo.id}`}
      className={`group relative block overflow-hidden rounded-2xl bg-cover bg-center ${big ? "col-span-2 row-span-2" : ""}`}
      style={{ backgroundImage: `url(${photo.image_url})` }}
    >
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-dusk-950/85 via-dusk-950/5 via-45% to-transparent to-65%" />
      <LikeButton photoId={photo.id} initialCount={photo.likes_count} />
      <div className="absolute inset-x-0 bottom-0 z-[2] flex items-end justify-between p-4">
        <div className="font-display text-base font-medium">
          {locationName}
          <small className="mt-0.5 block font-mono text-[0.68rem] font-normal opacity-70">{city}</small>
        </div>
        <div className="flex gap-2.5 font-mono text-xs">
          <span className="flex items-center gap-1">❤ {photo.likes_count}</span>
          {commentsCount !== undefined && <span className="flex items-center gap-1">💬 {commentsCount}</span>}
        </div>
      </div>
    </Link>
  );
}
