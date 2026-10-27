"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import KebabMenu from "@/components/ui/KebabMenu";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import ChangePasswordModal from "@/components/profile/ChangePasswordModal";
import { useAuth } from "@/lib/hooks/useAuth";
import { getUserPhotos } from "@/lib/api/auth";
import type { PublicUser } from "@/types/user";
import type { Photo } from "@/types/photo";

interface ProfileMenuProps {
  user: PublicUser;
}

const menuItemClass =
  "block w-full px-4 py-2.5 text-left text-sm font-medium opacity-85 hover:opacity-100 hover:bg-white/5 disabled:opacity-40 light:hover:bg-black/5";

export default function ProfileMenu({ user }: ProfileMenuProps) {
  const { user: authUser, deleteAccount } = useAuth();
  const router = useRouter();
  const [isPasswordOpen, setIsPasswordOpen] = useState(false);
  const [passwordChanged, setPasswordChanged] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Contas do Google não têm senha (hasPassword === false) - não há o que alterar.
  const canChangePassword = authUser?.hasPassword !== false;

  useEffect(() => {
    if (!passwordChanged) return;
    const timer = setTimeout(() => setPasswordChanged(false), 4000);
    return () => clearTimeout(timer);
  }, [passwordChanged]);

  const handleExport = async () => {
    setIsExporting(true);
    setError(null);
    try {
      // A API não tem endpoint pra listar comentários/avaliações de um usuário (só
      // fotos) - exportação cobre o que está disponível hoje: perfil + fotos.
      const photos: Photo[] = [];
      let cursor: string | undefined;
      while (true) {
        const page = await getUserPhotos(user.id, cursor);
        photos.push(...page.items);
        if (!page.hasMore || !page.nextCursor) break;
        cursor = page.nextCursor;
      }

      const data = { exportedAt: new Date().toISOString(), profile: user, photos };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `sunset-meus-dados-${user.id}.json`;
      link.click();
      URL.revokeObjectURL(url);
    } catch {
      setError("Não foi possível gerar o arquivo agora.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    setError(null);
    try {
      await deleteAccount();
      router.push("/");
    } catch {
      setError("Não foi possível excluir a conta agora.");
      setIsDeleting(false);
      setIsDeleteOpen(false);
    }
  };

  return (
    <div className="relative">
      <KebabMenu label="Mais opções da conta">
        <button type="button" onClick={handleExport} disabled={isExporting} className={menuItemClass}>
          {isExporting ? "Gerando arquivo..." : "Baixar meus dados"}
        </button>
        {canChangePassword && (
          <button type="button" onClick={() => setIsPasswordOpen(true)} className={menuItemClass}>
            Alterar senha
          </button>
        )}
        <button type="button" onClick={() => setIsDeleteOpen(true)} className={`${menuItemClass} text-sun-deep`}>
          Excluir minha conta
        </button>
      </KebabMenu>

      {error && <p className="absolute top-full right-0 mt-2 w-48 text-right text-xs text-sun-deep">{error}</p>}
      {passwordChanged && (
        <p role="status" className="absolute top-full right-0 mt-2 w-48 text-right text-xs text-sun-mid light:text-sun-deep">
          Senha alterada
        </p>
      )}

      <ChangePasswordModal
        open={isPasswordOpen}
        onChanged={() => {
          setIsPasswordOpen(false);
          setPasswordChanged(true);
        }}
        onCancel={() => setIsPasswordOpen(false)}
      />

      <ConfirmDialog
        open={isDeleteOpen}
        title="Excluir sua conta?"
        description="Essa ação não pode ser desfeita. Seu nome, e-mail, foto de perfil e bio serão apagados. Suas fotos, comentários e avaliações continuam visíveis, mas passam a aparecer como de um usuário excluído."
        confirmLabel="Excluir conta"
        isConfirming={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setIsDeleteOpen(false)}
      />
    </div>
  );
}
