"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { useAuth } from "@/lib/hooks/useAuth";
import { getUserPhotos } from "@/lib/api/auth";
import type { PublicUser } from "@/types/user";
import type { Photo } from "@/types/photo";

interface DeleteAccountSectionProps {
  user: PublicUser;
}

export default function DeleteAccountSection({ user }: DeleteAccountSectionProps) {
  const { deleteAccount } = useAuth();
  const router = useRouter();
  const [isExporting, setIsExporting] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    <div className="mt-8 flex flex-col items-center gap-2 border-t border-white/8 pt-6 text-xs sm:items-start light:border-line">
      <div className="flex gap-4">
        <button
          type="button"
          onClick={handleExport}
          disabled={isExporting}
          className="text-cream-dim underline opacity-70 hover:opacity-100 disabled:opacity-40 light:text-ink-dim light:opacity-100"
        >
          {isExporting ? "Gerando arquivo..." : "Baixar meus dados"}
        </button>
        <button type="button" onClick={() => setIsDeleteOpen(true)} className="text-sun-deep underline opacity-80 hover:opacity-100">
          Excluir minha conta
        </button>
      </div>
      {error && <p className="text-sun-deep">{error}</p>}

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
