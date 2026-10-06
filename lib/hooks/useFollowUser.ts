"use client";

import { useState } from "react";
import { followUser, unfollowUser } from "@/lib/api/auth";
import { useAuth } from "@/lib/hooks/useAuth";

export function useFollowUser(userId: string, initialFollowing: boolean) {
  const { isAuthenticated, getAccessToken } = useAuth();
  const [following, setFollowing] = useState(initialFollowing);

  const toggle = async () => {
    if (!isAuthenticated) return;

    const next = !following;
    setFollowing(next);

    try {
      const token = await getAccessToken();
      if (!token) throw new Error("not authenticated");
      await (next ? followUser : unfollowUser)(userId, token);
    } catch {
      setFollowing(!next);
    }
  };

  return { following, toggle };
}
