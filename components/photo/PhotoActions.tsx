"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { useAuth } from "@/lib/hooks/useAuth";
import { deletePhoto } from "@/lib/api/photos";
import type { Photo } from "@/types/photo";

interface PhotoActionsProps {
  photo: Photo;
}

export default function PhotoActions({ photo }: PhotoActionsProps) {
  const { user, getAccessToken } = useAuth();
  const router = useRouter();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (user?.id !== photo.userId) return null;

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    setError(null);
    try {
      const token = await getAccessToken();
      if (!token) {
        setError("Sua sessão expirou. Entre novamente.");
        return;
      }
      await deletePhoto(photo.id, token);
      router.push(`/profile/${photo.userId}`);
    } catch {
      setError("Não foi possível excluir a foto agora.");
    } finally {
      setIsDeleting(false);
      setConfirmOpen(false);
    }
  };

  return (
    <div className="mb-8">
      <button
        type="button"
        onClick={() => setConfirmOpen(true)}
        className="text-sm text-cream-dim opacity-70 hover:text-sun-deep hover:opacity-100 light:text-ink-dim light:opacity-100"
      >
        Excluir foto
      </button>
      {error && <p className="mt-2 text-sm text-sun-deep">{error}</p>}

      <ConfirmDialog
        open={confirmOpen}
        title="Excluir foto?"
        description="Essa ação não pode ser desfeita. A foto, curtidas e comentários serão removidos permanentemente."
        confirmLabel="Excluir"
        isConfirming={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
}
