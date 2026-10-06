"use client";

import { useState } from "react";
import { getUserFollowers, getUserFollowing } from "@/lib/api/auth";
import type { PublicUser } from "@/types/user";
import type { CursorPage } from "@/types/pagination";

type Kind = "followers" | "following";

const FETCHERS: Record<Kind, typeof getUserFollowers> = {
  followers: getUserFollowers,
  following: getUserFollowing,
};

export function useUserConnections(userId: string, kind: Kind, initialPage: CursorPage<PublicUser>) {
  const [users, setUsers] = useState(initialPage.items);
  const [cursor, setCursor] = useState(initialPage.nextCursor);
  const [hasMore, setHasMore] = useState(initialPage.hasMore);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const loadMore = async () => {
    if (!cursor || isLoadingMore) return;

    setIsLoadingMore(true);
    try {
      const page = await FETCHERS[kind](userId, cursor);
      setUsers((prev) => [...prev, ...page.items]);
      setCursor(page.nextCursor);
      setHasMore(page.hasMore);
    } finally {
      setIsLoadingMore(false);
    }
  };

  return { users, hasMore, isLoadingMore, loadMore };
}
