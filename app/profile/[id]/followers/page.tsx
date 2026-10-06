import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getUser, getUserFollowers } from "@/lib/api/auth";
import BackButton from "@/components/ui/BackButton";
import UserList from "@/components/profile/UserList";

export async function generateMetadata({ params }: PageProps<"/profile/[id]/followers">): Promise<Metadata> {
  const { id } = await params;
  try {
    const user = await getUser(id);
    return { title: `Seguidores de ${user.name} — Sunset` };
  } catch {
    return { title: "Seguidores — Sunset" };
  }
}

export default async function FollowersPage({ params }: PageProps<"/profile/[id]/followers">) {
  const { id } = await params;

  const user = await getUser(id).catch(() => null);
  if (!user) {
    notFound();
  }

  const followers = await getUserFollowers(id).catch(() => ({ items: [], nextCursor: null, hasMore: false }));

  return (
    <div className="px-[5vw] py-32">
      <BackButton />
      <h1 className="mb-8 font-display text-2xl font-semibold">Seguidores de {user.name}</h1>
      <UserList userId={id} kind="followers" initialPage={followers} emptyMessage="Ainda não há seguidores." />
    </div>
  );
}
