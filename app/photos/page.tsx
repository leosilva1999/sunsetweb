import type { Metadata } from "next";
import PhotoFeed from "@/components/photo/PhotoFeed";
import { getPhotos } from "@/lib/api/photos";

export const metadata: Metadata = { title: "Fotos — Sunset" };

// Sem searchParams/cookies, essa página seria estática e congelaria as fotos
// do momento do build — revalida periodicamente em vez de exigir um redeploy.
export const revalidate = 60;

export default async function PhotosPage() {
  const initialPage = await getPhotos("recent").catch(() => ({ items: [], nextCursor: null, hasMore: false }));

  return (
    <div className="px-[5vw] py-32">
      <h1 className="mb-6 font-display text-3xl font-semibold">Fotos da comunidade</h1>
      <PhotoFeed initialSort="recent" initialPage={initialPage} />
    </div>
  );
}
