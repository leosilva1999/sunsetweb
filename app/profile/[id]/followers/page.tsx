import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getUser, getUserFollowers } from "@/lib/api/auth";
import BackButton from "@/components/ui/BackButton";
import UserList from "@/components/profile/UserList";
import { NO_INDEX } from "@/lib/utils/shareMetadata";

export async function generateMetadata({ params }: PageProps<"/profile/[id]/followers">): Promise<Metadata> {
  const { id } = await params;
  try {
    const user = await getUser(id);
    // Lista de pessoas: sem valor próprio pra busca, e o perfil já é a página indexável.
    return { title: `Seguidores de ${user.name}`, ...NO_INDEX };
  } catch {
    return { title: "Seguidores", ...NO_INDEX };
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
