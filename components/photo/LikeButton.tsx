"use client";

import LikeButtonView from "@/components/photo/LikeButtonView";
import { useLikePhoto } from "@/lib/hooks/useLikePhoto";

interface LikeButtonProps {
  photoId: string;
  initialLiked?: boolean;
  initialCount: number;
}

export default function LikeButton({ photoId, initialLiked = false, initialCount }: LikeButtonProps) {
  const { liked, toggle } = useLikePhoto(photoId, initialLiked, initialCount);

  return <LikeButtonView liked={liked} onToggle={toggle} />;
}
