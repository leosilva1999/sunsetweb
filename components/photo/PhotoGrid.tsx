import type { Photo } from "@/types/photo";
import PhotoCard from "@/components/photo/PhotoCard";

export interface PhotoGridItem {
  photo: Photo;
  locationName: string;
  city: string;
}

interface PhotoGridProps {
  items: PhotoGridItem[];
}

export default function PhotoGrid({ items }: PhotoGridProps) {
  return (
    <div className="grid auto-rows-[180px] grid-cols-2 gap-3.5 md:grid-cols-4">
      {items.map((item, index) => (
        <PhotoCard key={item.photo.id} big={index === 0} {...item} />
      ))}
    </div>
  );
}
