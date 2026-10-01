import type { Photo } from "@/types/photo";
import PhotoCard from "@/components/photo/PhotoCard";

interface PhotoGridProps {
  items: Photo[];
}

export default function PhotoGrid({ items }: PhotoGridProps) {
  return (
    <div className="grid auto-rows-[180px] grid-cols-2 gap-3.5 md:grid-cols-4">
      {items.map((photo, index) => (
        <PhotoCard key={photo.id} photo={photo} big={index === 0} />
      ))}
    </div>
  );
}
