import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getUser } from "@/lib/api/auth";
import PhotoGrid from "@/components/photo/PhotoGrid";
import { apiFetch } from "@/lib/api/client";
import type { Photo } from "@/types/photo";
import type { CursorPage } from "@/types/pagination";

export async function generateMetadata({ params }: PageProps<"/profile/[id]">): Promise<Metadata> {
  const { id } = await params;
  try {
    const user = await getUser(id);
    return { title: `${user.name} — Sunset` };
  } catch {
    return { title: "Perfil — Sunset" };
  }
}

export default async function ProfilePage({ params }: PageProps<"/profile/[id]">) {
  const { id } = await params;

  const user = await getUser(id).catch(() => null);
  if (!user) {
    notFound();
  }

  const photos = await apiFetch<CursorPage<Photo>>(`/users/${id}/photos`).catch(() => ({
    items: [] as Photo[],
    nextCursor: null,
    hasMore: false,
  }));

  return (
    <div className="px-[5vw] py-32">
      <h1 className="mb-10 font-display text-3xl font-semibold">{user.name}</h1>
      {photos.items.length === 0 ? (
        <p className="text-sm text-cream-dim opacity-70 light:text-ink-dim light:opacity-100">Este usuário ainda não postou fotos.</p>
      ) : (
        <PhotoGrid
          items={photos.items.map((photo) => ({
            photo,
            locationName: photo.locationName,
            city: "",
          }))}
        />
      )}
    </div>
  );
}
