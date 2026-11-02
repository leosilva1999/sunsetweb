"use client";

import { useEffect, useState } from "react";
import Button from "@/components/ui/Button";
import { useAuth } from "@/lib/hooks/useAuth";
import { updateLocationDetails } from "@/lib/api/moderation";
import { getApiErrorMessage } from "@/lib/utils/apiErrorMessage";
import { LOCATION_CATEGORIES, categoryLabel } from "@/lib/utils/locationCategory";
import type { LocationCategory } from "@/types/location";

interface EditLocationDetailsDialogProps {
  open: boolean;
  locationId: string;
  locationName: string;
  description: string | null;
  category: LocationCategory | null;
  onSaved: () => void;
  onCancel: () => void;
}

const DESCRIPTION_MAX_LENGTH = 1000;

const fieldClass =
  "w-full rounded-2xl border border-white/15 bg-transparent px-5 py-3 text-sm text-cream placeholder:text-cream-dim focus:border-white/40 focus:outline-none light:border-ink/15 light:text-ink light:placeholder:text-ink-dim light:focus:border-ink/40";

// Descrição e tipo do local. Nome e cidade não se editam aqui (o slug é imutável; a cidade tem fluxo próprio).
export default function EditLocationDetailsDialog({
  open,
  locationId,
  locationName,
  description,
  category,
  onSaved,
  onCancel,
}: EditLocationDetailsDialogProps) {
  const { getAccessToken } = useAuth();
  const [text, setText] = useState(description ?? "");
  const [selected, setSelected] = useState<LocationCategory | "">(category ?? "");
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [wasOpen, setWasOpen] = useState(open);

  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setText(description ?? "");
      setSelected(category ?? "");
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

  const trimmed = text.trim();
  const descriptionChanged = trimmed !== (description ?? "");
  const categoryChanged = selected !== "" && selected !== category;
  const canSave = descriptionChanged || categoryChanged;

  const handleSave = async () => {
    setError(null);
    setIsSaving(true);
    try {
      const token = await getAccessToken();
      if (!token) {
        setError("Sua sessão expirou. Entre novamente.");
        return;
      }
      await updateLocationDetails(
        locationId,
        {
          ...(descriptionChanged ? { description: trimmed } : {}),
          ...(categoryChanged ? { category: selected as LocationCategory } : {}),
        },
        token,
      );
      onSaved();
    } catch (err) {
      setError(getApiErrorMessage(err, "Não foi possível salvar agora. Tente novamente."));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-dusk-950/70 px-4 backdrop-blur-sm" onClick={onCancel}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-details-title"
        onClick={(event) => event.stopPropagation()}
        className="w-full max-w-lg rounded-2xl border border-white/10 bg-dusk-900 p-6 light:border-line light:bg-paper"
      >
        <h2 id="edit-details-title" className="mb-2 font-display text-lg font-semibold">
          Editar descrição e tipo
        </h2>
        <p className="mb-4 text-sm text-cream-dim light:text-ink-dim">{locationName}</p>

        <div className="flex flex-col gap-4">
          <select
            value={selected}
            onChange={(event) => setSelected(event.target.value as LocationCategory | "")}
            aria-label="Tipo de local"
            className={fieldClass}
          >
            <option value="">{category ? "Tipo de local" : "Sem tipo definido"}</option>
            {LOCATION_CATEGORIES.map((value) => (
              <option key={value} value={value}>
                {categoryLabel(value)}
              </option>
            ))}
          </select>
          <div>
            <textarea
              value={text}
              onChange={(event) => setText(event.target.value)}
              maxLength={DESCRIPTION_MAX_LENGTH}
              rows={5}
              placeholder="Descrição (deixe vazio para limpar)"
              className={`resize-none ${fieldClass}`}
            />
            <p className="mt-1 text-right font-mono text-xs text-cream-dim opacity-70 light:text-ink-dim light:opacity-100">
              {text.length}/{DESCRIPTION_MAX_LENGTH}
            </p>
          </div>
        </div>

        {error && <p className="mt-3 text-sm text-sun-deep">{error}</p>}
        <div className="mt-5 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full border border-white/15 px-5 py-2.5 text-sm font-medium opacity-85 hover:opacity-100 light:border-ink/15"
          >
            Cancelar
          </button>
          <Button type="button" variant="accent" disabled={!canSave || isSaving} onClick={handleSave}>
            {isSaving ? "Salvando..." : "Salvar"}
          </Button>
        </div>
      </div>
    </div>
  );
}
