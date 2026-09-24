"use client";

import { useState } from "react";
import Image from "next/image";
import { useAuth } from "@/lib/hooks/useAuth";
import { useUploadModal } from "@/lib/hooks/useUploadModal";
import { formatDate } from "@/lib/utils/formatDate";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import EditProfileModal from "@/components/profile/EditProfileModal";
import DeleteAccountSection from "@/components/profile/DeleteAccountSection";
import type { PublicUser } from "@/types/user";

interface ProfileHeaderProps {
  user: PublicUser;
}

export default function ProfileHeader({ user }: ProfileHeaderProps) {
  const { user: authUser, logout } = useAuth();
  const { open: openUploadModal } = useUploadModal();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const isOwnProfile = authUser?.id === user.id;
  const displayedUser = isOwnProfile && authUser ? authUser : user;

  const handleConfirmLogout = async () => {
    setIsLoggingOut(true);
    await logout();
    setIsLoggingOut(false);
    setIsLogoutOpen(false);
  };

  return (
    <div className="mb-14">
      <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:items-center sm:text-left">
        {displayedUser.avatarUrl ? (
          // unoptimized: avatarUrl é uma URL arbitrária que o próprio usuário escolhe
          // (ver EditProfileModal) - não dá pra colocar todo host possível em
          // remotePatterns, e permitir qualquer host lá seria abrir um proxy de
          // imagens pro servidor buscar URLs arbitrárias de terceiros.
          <Image src={displayedUser.avatarUrl} alt="" width={96} height={96} unoptimized className="h-24 w-24 rounded-full object-cover" />
        ) : (
          <span className="flex h-24 w-24 items-center justify-center rounded-full bg-cream/15 font-display text-3xl light:bg-ink/10">
            {displayedUser.name.charAt(0).toUpperCase()}
          </span>
        )}

        <div className="flex-1">
          <h1 className="font-display text-3xl font-semibold">{displayedUser.name}</h1>
          <div className="mt-1.5 font-mono text-xs text-cream-dim opacity-70 light:text-ink-dim light:opacity-100">
            Entrou em {formatDate(displayedUser.createdAt)}
          </div>
          {displayedUser.bio ? (
            <p className="mt-3 max-w-md text-sm text-cream-dim light:text-ink-dim">{displayedUser.bio}</p>
          ) : (
            isOwnProfile && (
              <p className="mt-3 text-sm text-cream-dim opacity-60 italic light:text-ink-dim light:opacity-100">
                Adicione uma descrição sobre você.
              </p>
            )
          )}
        </div>

        {isOwnProfile && (
          <div className="flex gap-3">
            <button
              onClick={openUploadModal}
              className="rounded-full bg-cream px-4 py-2.5 text-sm font-bold text-ink transition-transform hover:-translate-y-0.5 light:bg-ink light:text-paper"
            >
              Postar foto
            </button>
            <button
              onClick={() => setIsEditOpen(true)}
              className="rounded-full border border-white/15 px-4 py-2.5 text-sm font-medium opacity-85 hover:opacity-100 light:border-ink/15"
            >
              Editar perfil
            </button>
            <button
              onClick={() => setIsLogoutOpen(true)}
              className="rounded-full border border-white/15 px-4 py-2.5 text-sm font-medium opacity-85 hover:opacity-100 light:border-ink/15"
            >
              Sair
            </button>
          </div>
        )}

        {isOwnProfile && (
          <>
            <EditProfileModal
              open={isEditOpen}
              user={displayedUser}
              onSaved={() => setIsEditOpen(false)}
              onCancel={() => setIsEditOpen(false)}
            />
            <ConfirmDialog
              open={isLogoutOpen}
              title="Sair da conta?"
              description="Você precisará entrar novamente para curtir, comentar ou avaliar locais."
              confirmLabel="Sair"
              isConfirming={isLoggingOut}
              onConfirm={handleConfirmLogout}
              onCancel={() => setIsLogoutOpen(false)}
            />
          </>
        )}
      </div>

      {isOwnProfile && <DeleteAccountSection user={displayedUser} />}
    </div>
  );
}
