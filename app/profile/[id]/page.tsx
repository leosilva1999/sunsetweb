import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getUser, getUserPhotos } from "@/lib/api/auth";
import ProfileHeader from "@/components/profile/ProfileHeader";
import ProfilePhotos from "@/components/profile/ProfilePhotos";

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

  const photos = await getUserPhotos(id).catch(() => ({
    items: [],
    nextCursor: null,
    hasMore: false,
  }));

  return (
    <div className="px-[5vw] py-32">
      <ProfileHeader user={user} />
      <ProfilePhotos userId={id} initialPage={photos} />
    </div>
  );
}
