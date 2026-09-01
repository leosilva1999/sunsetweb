"use client";

import { useLikePhoto } from "@/lib/hooks/useLikePhoto";

interface LikeButtonProps {
  photoId: string;
  initialLiked?: boolean;
  initialCount: number;
}

export default function LikeButton({ photoId, initialLiked = false, initialCount }: LikeButtonProps) {
  const { liked, toggle } = useLikePhoto(photoId, initialLiked, initialCount);

  return (
    <button
      onClick={(event) => {
        event.preventDefault();
        toggle();
      }}
      className="absolute top-3 right-3 z-[3] flex h-8.5 w-8.5 items-center justify-center rounded-full bg-dusk-950/50 backdrop-blur-sm transition-transform hover:scale-110 light:bg-white/85"
      aria-label={liked ? "Descurtir foto" : "Curtir foto"}
    >
      <svg
        viewBox="0 0 24 24"
        strokeWidth={2}
        className={`h-4 w-4 stroke-cream light:stroke-ink ${liked ? "fill-sun-deep stroke-sun-deep" : "fill-none"}`}
      >
        <path d="M12 21s-7-4.5-9.5-9C.7 8.4 2 5 5.2 4.2 7.5 3.6 9.8 4.7 12 7c2.2-2.3 4.5-3.4 6.8-2.8C22 5 23.3 8.4 21.5 12 19 16.5 12 21 12 21z" />
      </svg>
    </button>
  );
}
