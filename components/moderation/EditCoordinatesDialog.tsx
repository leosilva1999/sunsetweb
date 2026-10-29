"use client";

import { useEffect, useState } from "react";
import Button from "@/components/ui/Button";
import MapPicker from "@/components/location/MapPicker";
import { useAuth } from "@/lib/hooks/useAuth";
import { updateLocationCoordinates } from "@/lib/api/moderation";
import { ApiError } from "@/lib/api/client";

interface EditCoordinatesDialogProps {
  open: boolean;
  locationId: string;
  locationName: string;
  latitude: number;
  longitude: number;
  onSaved: () => void;
  onCancel: () => void;
}

export default function EditCoordinatesDialog({
  open,
  locationId,
  locationName,
  latitude,
  longitude,
  onSaved,
  onCancel,
}: EditCoordinatesDialogProps) {
  const { getAccessToken } = useAuth();
  const [position, setPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [wasOpen, setWasOpen] = useState(open);

  // Zera ao abrir (padrão do React pra ajustar estado quando uma prop muda).
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setPosition(null);
      setError(null);
    }
  }

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onCancel]);

  if (!open) return null;

  const handleSave = async () => {
    if (!position) return;
    setError(null);

    if (position.lat < -90 || position.lat > 90 || position.lng < -180 || position.lng > 180) {
      setError("Coordenadas fora do intervalo válido.");
      return;
    }

    setIsSaving(true);
    try {
      const token = await getAccessToken();
      if (!token) {
        setError("Sua sessão expirou. Entre novamente.");
        return;
      }
      await updateLocationCoordinates(locationId, position.lat, position.lng, token);
      onSaved();
    } catch (err) {
      if (err instanceof ApiError && err.status === 403) {
        setError("Você não tem permissão para editar este local.");
      } else if (err instanceof ApiError && err.status === 404) {
        setError("Este local não existe mais.");
      } else if (err instanceof ApiError && err.status === 400) {
        setError("Coordenadas inválidas.");
      } else {
        setError("Não foi possível salvar agora. Tente novamente.");
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-dusk-950/70 px-4 backdrop-blur-sm" onClick={onCancel}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-coordinates-title"
        onClick={(event) => event.stopPropagation()}
        className="w-full max-w-lg rounded-2xl border border-white/10 bg-dusk-900 p-6 light:border-line light:bg-paper"
      >
        <h2 id="edit-coordinates-title" className="mb-2 font-display text-lg font-semibold">
          Corrigir localização
        </h2>
        <p className="mb-4 text-sm text-cream-dim light:text-ink-dim">
          {locationName}: clique no mapa ou arraste o marcador para o ponto certo. A mudança vale na hora para a distância
          e o horário do pôr do sol.
        </p>

        <MapPicker latitude={latitude} longitude={longitude} onChange={(lat, lng) => setPosition({ lat, lng })} />

        <p className="mt-3 font-mono text-xs text-cream-dim opacity-70 light:text-ink-dim light:opacity-100">
          Atual: {latitude.toFixed(5)}, {longitude.toFixed(5)}
          {position && ` → Novo: ${position.lat.toFixed(5)}, ${position.lng.toFixed(5)}`}
        </p>

        {error && <p className="mt-3 text-sm text-sun-deep">{error}</p>}
        <div className="mt-5 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full border border-white/15 px-5 py-2.5 text-sm font-medium opacity-85 hover:opacity-100 light:border-ink/15"
          >
            Cancelar
          </button>
          <Button type="button" variant="accent" disabled={!position || isSaving} onClick={handleSave}>
            {isSaving ? "Salvando..." : "Salvar"}
          </Button>
        </div>
      </div>
    </div>
  );
}
