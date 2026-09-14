"use client";

import { useState } from "react";
import RatingWidget from "@/components/location/RatingWidget";
import RatingList from "@/components/location/RatingList";
import { getLocationRatings } from "@/lib/api/locations";
import type { Rating } from "@/types/rating";
import type { CursorPage } from "@/types/pagination";

interface LocationRatingsProps {
  locationId: string;
  initialPage: CursorPage<Rating>;
}

export default function LocationRatings({ locationId, initialPage }: LocationRatingsProps) {
  const [ratings, setRatings] = useState(initialPage.items);
  const [cursor, setCursor] = useState(initialPage.nextCursor);
  const [hasMore, setHasMore] = useState(initialPage.hasMore);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const handleChanged = (updated: Rating | null, previous: Rating | null) => {
    setRatings((prev) => {
      if (updated) {
        if (previous) {
          return prev.map((rating) => (rating.id === previous.id ? updated : rating));
        }
        return [updated, ...prev];
      }
      if (previous) {
        return prev.filter((rating) => rating.id !== previous.id);
      }
      return prev;
    });
  };

  const loadMore = async () => {
    if (!cursor || isLoadingMore) return;
    setIsLoadingMore(true);
    try {
      const page = await getLocationRatings(locationId, cursor);
      setRatings((prev) => [...prev, ...page.items]);
      setCursor(page.nextCursor);
      setHasMore(page.hasMore);
    } finally {
      setIsLoadingMore(false);
    }
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[320px_1fr]">
      <RatingWidget locationId={locationId} onChanged={handleChanged} />
      <div>
        <RatingList ratings={ratings} />
        {hasMore && (
          <button
            onClick={loadMore}
            disabled={isLoadingMore}
            className="mt-4 text-sm font-medium text-sun-mid hover:opacity-80 light:text-sun-deep"
          >
            {isLoadingMore ? "Carregando..." : "Carregar mais"}
          </button>
        )}
      </div>
    </div>
  );
}
