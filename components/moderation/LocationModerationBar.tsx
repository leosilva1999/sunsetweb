"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import EditCoordinatesDialog from "@/components/moderation/EditCoordinatesDialog";
import MergeLocationDialog from "@/components/moderation/MergeLocationDialog";
import { useAuth } from "@/lib/hooks/useAuth";
import { deleteLocation } from "@/lib/api/moderation";
import { ApiError } from "@/lib/api/client";

interface LocationModerationBarProps {
  locationId: string;
  name: string;
  latitude: number;
  longitude: number;
}

const buttonClass =
  "rounded-full border border-white/15 px-4 py-2 text-xs font-medium opacity-85 hover:opacity-100 light:border-ink/15";

// A página do local é renderizada no servidor, então o papel é checado aqui no cliente. É só
// conveniência: quem não é moderador nem admin recebe 403 da API de qualquer jeito.
export default function LocationModerationBar({ locationId, name, latitude, longitude }: LocationModerationBarProps) {
  const { user, getAccessToken } = useAuth();
  const router = useRouter();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isMergeOpen, setIsMergeOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!user || (user.role !== "Moderator" && user.role !== "Admin")) return null;

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    setError(null);
    try {
      const token = await getAccessToken();
      if (!token) {
        setError("Sua sessão expirou. Entre novamente.");
        return;
      }
      await deleteLocation(locationId, token);
      router.push("/locations");
    } catch (err) {
      setError(err instanceof ApiError && err.status === 404 ? "Este local já foi excluído." : "Não foi possível excluir o local agora.");
    } finally {
      setIsDeleting(false);
      setIsDeleteOpen(false);
    }
  };

  return (
    <div className="mt-4 rounded-2xl border border-dashed border-white/20 p-4 light:border-ink/20">
      <p className="mb-3 font-mono text-xs tracking-[0.14em] text-cream-dim uppercase opacity-70 light:text-ink-dim light:opacity-100">
        Moderação
      </p>
      <div className="flex flex-wrap gap-3">
        <button type="button" onClick={() => setIsEditOpen(true)} className={buttonClass}>
          Editar localização
        </button>
        <button type="button" onClick={() => setIsMergeOpen(true)} className={buttonClass}>
          Mesclar em…
        </button>
        <button
          type="button"
          onClick={() => setIsDeleteOpen(true)}
          className="rounded-full border border-sun-deep/40 px-4 py-2 text-xs font-medium text-sun-deep hover:bg-sun-deep/10"
        >
          Excluir local
        </button>
      </div>
      {error && <p className="mt-3 text-sm text-sun-deep">{error}</p>}

      <EditCoordinatesDialog
        open={isEditOpen}
        locationId={locationId}
        locationName={name}
        latitude={latitude}
        longitude={longitude}
        onSaved={() => {
          setIsEditOpen(false);
          router.refresh();
        }}
        onCancel={() => setIsEditOpen(false)}
      />
      <MergeLocationDialog
        open={isMergeOpen}
        duplicateId={locationId}
        duplicateName={name}
        onMerged={(targetId) => {
          setIsMergeOpen(false);
          router.push(`/locations/${targetId}`);
        }}
        onCancel={() => setIsMergeOpen(false)}
      />
      <ConfirmDialog
        open={isDeleteOpen}
        title="Excluir este local?"
        description="O local e todas as fotos dele somem do site. Dá para restaurar depois, na aba “Locais excluídos” do painel de moderação."
        confirmLabel="Excluir local"
        isConfirming={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setIsDeleteOpen(false)}
      />
    </div>
  );
}
