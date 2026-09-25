"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import ReportDialog from "@/components/moderation/ReportDialog";
import { useAuth } from "@/lib/hooks/useAuth";
import { deletePhoto } from "@/lib/api/photos";
import type { Photo } from "@/types/photo";

interface PhotoActionsProps {
  photo: Photo;
}

const reportTriggerClassName =
  "inline-flex items-center gap-2 rounded-full border border-white/15 px-5 py-2.5 text-sm font-medium opacity-85 hover:opacity-100 light:border-ink/15";

export default function PhotoActions({ photo }: PhotoActionsProps) {
  const { user, getAccessToken } = useAuth();
  const router = useRouter();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!user) return null;

  if (user.id !== photo.userId) {
    return (
      <div className="mb-8">
        <ReportDialog targetType="Photo" targetId={photo.id} triggerClassName={reportTriggerClassName} />
      </div>
    );
  }

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
        className="inline-flex items-center gap-2 rounded-full border border-sun-deep/40 px-5 py-2.5 text-sm font-medium text-sun-deep transition-colors hover:bg-sun-deep/10"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0-1 14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 6h16Z" />
        </svg>
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
