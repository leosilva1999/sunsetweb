import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPhoto, getPhotoComments } from "@/lib/api/photos";
import { getLocation } from "@/lib/api/locations";
import LikeButton from "@/components/photo/LikeButton";
import Comments from "@/components/photo/Comments";

export async function generateMetadata({ params }: PageProps<"/photos/[id]">): Promise<Metadata> {
  const { id } = await params;
  try {
    const photo = await getPhoto(id);
    return { title: photo.caption ? `${photo.caption} — Sunset` : "Foto — Sunset" };
  } catch {
    return { title: "Foto — Sunset" };
  }
}

export default async function PhotoDetailPage({ params }: PageProps<"/photos/[id]">) {
  const { id } = await params;

  const photo = await getPhoto(id).catch(() => null);
  if (!photo) {
    notFound();
  }

  const [location, comments] = await Promise.all([
    getLocation(photo.locationId).catch(() => null),
    getPhotoComments(id).catch(() => ({ items: [], nextCursor: null, hasMore: false })),
  ]);

  return (
    <div className="grid grid-cols-1 gap-10 px-[5vw] py-32 lg:grid-cols-[1.4fr_1fr]">
      <div className="relative aspect-4/3 overflow-hidden rounded-2xl bg-cover bg-center" style={{ backgroundImage: `url(${photo.imageUrl})` }}>
        <LikeButton photoId={photo.id} initialLiked={photo.likedByCurrentUser} initialCount={photo.likesCount} />
      </div>

      <div>
        {location && (
          <>
            <span className="mb-1 block font-mono text-xs tracking-[0.14em] text-sun-mid uppercase light:text-sun-deep">
              {location.city}
            </span>
            <h1 className="mb-2 font-display text-2xl font-semibold">{location.name}</h1>
          </>
        )}
        {photo.caption && <p className="mb-8 text-cream-dim light:text-ink-dim">{photo.caption}</p>}

        <h2 className="mb-4 font-display text-lg font-semibold">Comentários</h2>
        <Comments photoId={photo.id} initialPage={comments} />
      </div>
    </div>
  );
}
