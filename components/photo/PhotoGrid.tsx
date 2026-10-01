import { Fragment } from "react";
import type { Photo } from "@/types/photo";
import PhotoCard from "@/components/photo/PhotoCard";
import InFeedAd from "@/components/ads/InFeedAd";

const AD_INTERVAL = 6;

interface PhotoGridProps {
  items: Photo[];
  showAds?: boolean;
}

export default function PhotoGrid({ items, showAds = false }: PhotoGridProps) {
  return (
    <div className="grid auto-rows-[180px] grid-cols-2 gap-3.5 md:grid-cols-4">
      {items.map((photo, index) => (
        <Fragment key={photo.id}>
          <PhotoCard photo={photo} big={index === 0} />
          {showAds && (index + 1) % AD_INTERVAL === 0 && <InFeedAd />}
        </Fragment>
      ))}
    </div>
  );
}
