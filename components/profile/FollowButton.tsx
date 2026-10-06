"use client";

import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";
import { useFollowUser } from "@/lib/hooks/useFollowUser";

interface FollowButtonProps {
  userId: string;
  initialFollowing: boolean;
}

export default function FollowButton({ userId, initialFollowing }: FollowButtonProps) {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { following, toggle } = useFollowUser(userId, initialFollowing);

  const handleClick = () => {
    if (!isAuthenticated) {
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }
    toggle();
  };

  return (
    <button
      onClick={handleClick}
      className={
        following
          ? "rounded-full border border-white/15 px-4 py-2.5 text-sm font-medium opacity-85 hover:opacity-100 light:border-ink/15"
          : "rounded-full bg-cream px-4 py-2.5 text-sm font-bold text-ink transition-transform hover:-translate-y-0.5 light:bg-ink light:text-paper"
      }
    >
      {following ? "Seguindo" : "Seguir"}
    </button>
  );
}
