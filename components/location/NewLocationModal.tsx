"use client";

import { useEffect, useState, type FormEvent } from "react";
import { createPortal } from "react-dom";
import Button from "@/components/ui/Button";
import MapPicker from "@/components/location/MapPicker";
import { useAuth } from "@/lib/hooks/useAuth";
import { searchLocations, createLocation } from "@/lib/api/locations";
import { ApiError } from "@/lib/api/client";
import type { Location } from "@/types/location";

interface NewLocationModalProps {
  open: boolean;
  initialName: string;
  onCreated: (location: Location) => void;
  onSelectExisting: (location: Location) => void;
  onCancel: () => void;
}

const DUPLICATE_RADIUS_KM = 0.5;
const DEBOUNCE_MS = 400;

export default function NewLocationModal({ open, initialName, onCreated, onSelectExisting, onCancel }: NewLocationModalProps) {
  const { getAccessToken } = useAuth();
  const [name, setName] = useState(initialName);
  const [city, setCity] = useState("");
  const [position, setPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [duplicates, setDuplicates] = useState<Location[]>([]);
  const [duplicatesDismissed, setDuplicatesDismissed] = useState(false);
  const [isCheckingDuplicates, setIsCheckingDuplicates] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [wasOpen, setWasOpen] = useState(open);

  // Reajusta o estado durante a renderização (não num efeito) ao abrir o modal —
  // mesmo padrão já usado em EditProfileModal/UploadPhotoModal/RatingWidget.
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setName(initialName);
      setCity("");
      setPosition(null);
      setDuplicates([]);
      setDuplicatesDismissed(false);
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

  // Ajusta o estado durante a renderização (não num efeito) quando nome ou
  // posição mudam — limpa duplicatas antigas e exige dispensar de novo antes
  // de poder criar, antes mesmo da busca debounced abaixo rodar.
  const trimmedName = name.trim();
  const duplicateCheckKey = `${trimmedName}|${position ? `${position.lat},${position.lng}` : ""}`;
  const [lastDuplicateCheckKey, setLastDuplicateCheckKey] = useState(duplicateCheckKey);
  if (duplicateCheckKey !== lastDuplicateCheckKey) {
    setLastDuplicateCheckKey(duplicateCheckKey);
    setDuplicatesDismissed(false);
    setDuplicates([]);
  }

  // Checa duplicatas por nome (busca textual) e por proximidade (uma vez que o
  // pino é posicionado), mesclando os resultados.
  useEffect(() => {
    if (!open) return;
    if (!trimmedName && !position) return;

    const timeoutId = setTimeout(async () => {
      setIsCheckingDuplicates(true);
      try {
        const [byName, byPosition] = await Promise.all([
          trimmedName ? searchLocations({ q: trimmedName, limit: 5 }) : null,
          position ? searchLocations({ lat: position.lat, lng: position.lng, radius: DUPLICATE_RADIUS_KM, limit: 5 }) : null,
        ]);
        const merged = new Map<string, Location>();
        for (const page of [byName, byPosition]) {
          if (!page) continue;
          for (const location of page.items) merged.set(location.id, location);
        }
        setDuplicates([...merged.values()]);
      } catch {
        // Checagem de duplicata é best-effort — uma falha aqui não deve travar
        // o fluxo de criação.
      } finally {
        setIsCheckingDuplicates(false);
      }
    }, DEBOUNCE_MS);

    return () => clearTimeout(timeoutId);
  }, [open, trimmedName, position]);

  if (!open) return null;

  const hasPendingDuplicates = duplicates.length > 0 && !duplicatesDismissed;

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!position) {
      setError("Posicione o local no mapa.");
      return;
    }
    if (hasPendingDuplicates) return;

    setIsSubmitting(true);
    setError(null);
    try {
      const token = await getAccessToken();
      if (!token) {
        setError("Sua sessão expirou. Entre novamente.");
        return;
      }
      const location = await createLocation(
        { name: name.trim(), city: city.trim(), latitude: position.lat, longitude: position.lng },
        token,
      );
      onCreated(location);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Não foi possível criar o local agora.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Portal pro <body> — LocationPicker (que abre este modal) vive dentro do
  // <form> do UploadPhotoModal, e este modal tem seu próprio <form>; sem o
  // portal, o HTML resultante teria um <form> aninhado dentro de outro
  // (inválido — erro de hidratação e comportamento de submit imprevisível).
  return createPortal(
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-dusk-950/70 px-4 backdrop-blur-sm" onClick={onCancel}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="new-location-title"
        onClick={(event) => event.stopPropagation()}
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-white/10 bg-dusk-900 p-6 light:border-line light:bg-paper"
      >
        <h2 id="new-location-title" className="mb-6 font-display text-lg font-semibold">
          Adicionar novo local
        </h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Nome do local"
            required
            className="rounded-full border border-white/15 bg-transparent px-5 py-3 text-sm text-cream placeholder:text-cream-dim focus:border-white/40 focus:outline-none light:border-ink/15 light:text-ink light:placeholder:text-ink-dim light:focus:border-ink/40"
          />
          <input
            type="text"
            value={city}
            onChange={(event) => setCity(event.target.value)}
            placeholder="Cidade"
            required
            className="rounded-full border border-white/15 bg-transparent px-5 py-3 text-sm text-cream placeholder:text-cream-dim focus:border-white/40 focus:outline-none light:border-ink/15 light:text-ink light:placeholder:text-ink-dim light:focus:border-ink/40"
          />

          <MapPicker latitude={position?.lat ?? null} longitude={position?.lng ?? null} onChange={(lat, lng) => setPosition({ lat, lng })} />

          {(duplicates.length > 0 || isCheckingDuplicates) && (
            <div className="rounded-2xl border border-sun-deep/40 bg-sun-deep/10 p-4">
              <p className="mb-2 text-sm font-medium">
                {isCheckingDuplicates && duplicates.length === 0 ? "Checando locais parecidos..." : "Local parecido encontrado — é um desses?"}
              </p>
              {duplicates.length > 0 && (
                <>
                  <ul className="flex flex-col gap-2">
                    {duplicates.map((location) => (
                      <li key={location.id}>
                        <button
                          type="button"
                          onClick={() => onSelectExisting(location)}
                          className="w-full rounded-xl border border-white/10 px-3 py-2 text-left text-sm hover:bg-white/5 light:border-line light:hover:bg-black/5"
                        >
                          <span className="font-medium">{location.name}</span>{" "}
                          <span className="font-mono text-xs text-cream-dim opacity-70 light:text-ink-dim light:opacity-100">
                            · {location.city}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                  <button
                    type="button"
                    onClick={() => setDuplicatesDismissed(true)}
                    className="mt-3 text-xs font-medium text-cream-dim underline opacity-80 hover:opacity-100 light:text-ink-dim light:opacity-100"
                  >
                    Nenhum desses — continuar criando &quot;{name.trim()}&quot;
                  </button>
                </>
              )}
            </div>
          )}

          {error && <p className="text-sm text-sun-deep">{error}</p>}

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="rounded-full border border-white/15 px-5 py-2.5 text-sm font-medium opacity-85 hover:opacity-100 light:border-ink/15"
            >
              Cancelar
            </button>
            <Button type="submit" variant="accent" disabled={isSubmitting || hasPendingDuplicates}>
              {isSubmitting ? "Criando..." : "Criar local"}
            </Button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
}
