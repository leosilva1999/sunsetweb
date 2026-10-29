import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getUser, getUserPhotos } from "@/lib/api/auth";
import ProfileHeader from "@/components/profile/ProfileHeader";
import ProfilePhotos from "@/components/profile/ProfilePhotos";
import { buildPageMetadata } from "@/lib/utils/shareMetadata";

export async function generateMetadata({ params }: PageProps<"/profile/[id]">): Promise<Metadata> {
  const { id } = await params;
  try {
    const user = await getUser(id);
    return buildPageMetadata({
      title: user.name,
      description: user.bio ?? `Veja os pores do sol de ${user.name} no Sunsetsss.`,
      path: `/profile/${id}`,
      image: user.avatarUrl,
    });
  } catch {
    return { title: "Perfil" };
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
