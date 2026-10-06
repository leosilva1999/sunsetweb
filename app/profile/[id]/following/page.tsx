import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getUser, getUserFollowing } from "@/lib/api/auth";
import BackButton from "@/components/ui/BackButton";
import UserList from "@/components/profile/UserList";

export async function generateMetadata({ params }: PageProps<"/profile/[id]/following">): Promise<Metadata> {
  const { id } = await params;
  try {
    const user = await getUser(id);
    return { title: `${user.name} segue — Sunset` };
  } catch {
    return { title: "Seguindo — Sunset" };
  }
}

export default async function FollowingPage({ params }: PageProps<"/profile/[id]/following">) {
  const { id } = await params;

  const user = await getUser(id).catch(() => null);
  if (!user) {
    notFound();
  }

  const following = await getUserFollowing(id).catch(() => ({ items: [], nextCursor: null, hasMore: false }));

  return (
    <div className="px-[5vw] py-32">
      <BackButton />
      <h1 className="mb-8 font-display text-2xl font-semibold">{user.name} segue</h1>
      <UserList userId={id} kind="following" initialPage={following} emptyMessage="Ainda não segue ninguém." />
    </div>
  );
}
