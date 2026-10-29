"use client";

import { useEffect, useState, type FormEvent } from "react";
import Button from "@/components/ui/Button";
import { useAuth } from "@/lib/hooks/useAuth";
import { searchLocations } from "@/lib/api/locations";
import { mergeLocation } from "@/lib/api/moderation";
import { ApiError } from "@/lib/api/client";
import type { Location } from "@/types/location";

interface MergeLocationDialogProps {
  open: boolean;
  duplicateId: string;
  duplicateName: string;
  onMerged: (targetId: string) => void;
  onCancel: () => void;
}

const RESULTS_LIMIT = 8;

export default function MergeLocationDialog({ open, duplicateId, duplicateName, onMerged, onCancel }: MergeLocationDialogProps) {
  const { getAccessToken } = useAuth();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Location[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [target, setTarget] = useState<Location | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isMerging, setIsMerging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [wasOpen, setWasOpen] = useState(open);

  // Zera ao abrir (padrão do React pra ajustar estado quando uma prop muda).
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setQuery("");
      setResults([]);
      setHasSearched(false);
      setTarget(null);
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

  const handleSearch = async (event: FormEvent) => {
    event.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    setIsSearching(true);
    setError(null);
    try {
      const page = await searchLocations({ q: trimmed, limit: RESULTS_LIMIT });
      setResults(page.items.filter((location) => location.id !== duplicateId));
      setHasSearched(true);
    } catch (err) {
      setError(err instanceof ApiError && err.status === 429 ? "Muitas buscas seguidas. Aguarde alguns segundos." : "Não foi possível buscar agora.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleMerge = async () => {
    if (!target) return;
    setIsMerging(true);
    setError(null);
    try {
      const token = await getAccessToken();
      if (!token) {
        setError("Sua sessão expirou. Entre novamente.");
        return;
      }
      await mergeLocation(duplicateId, target.id, token);
      onMerged(target.id);
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setError("Não dá para mesclar um local com ele mesmo.");
      } else if (err instanceof ApiError && err.status === 404) {
        setError("Um dos locais não existe mais ou já foi excluído.");
      } else if (err instanceof ApiError && err.status === 403) {
        setError("Você não tem permissão para mesclar locais.");
      } else {
        setError("Não foi possível mesclar agora. Tente novamente.");
      }
    } finally {
      setIsMerging(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-dusk-950/70 px-4 backdrop-blur-sm" onClick={onCancel}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="merge-location-title"
        onClick={(event) => event.stopPropagation()}
        className="w-full max-w-md rounded-2xl border border-white/10 bg-dusk-900 p-6 light:border-line light:bg-paper"
      >
        <h2 id="merge-location-title" className="mb-2 font-display text-lg font-semibold">
          Mesclar em outro local
        </h2>
        <p className="mb-4 text-sm text-cream-dim light:text-ink-dim">
          &ldquo;{duplicateName}&rdquo; é o duplicado: ele some. Escolha abaixo o local que continua.
        </p>

        {target ? (
          <div className="mb-4 rounded-2xl border border-white/15 p-4 text-sm light:border-ink/15">
            <p className="font-medium">
              {target.name} <span className="font-normal text-cream-dim light:text-ink-dim">— {target.city}</span>
            </p>
            <p className="mt-3 text-sun-deep">
              As fotos e avaliações de &ldquo;{duplicateName}&rdquo; serão movidas para este local. Isso não pode ser desfeito: restaurar o
              duplicado depois devolve só um local vazio.
            </p>
            <button
              type="button"
              onClick={() => setTarget(null)}
              disabled={isMerging}
              className="mt-3 text-xs underline opacity-80 hover:opacity-100"
            >
              Escolher outro
            </button>
          </div>
        ) : (
          <>
            <form onSubmit={handleSearch} className="mb-3 flex gap-3">
              <input
                type="text"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Buscar o local que fica (nome ou cidade)"
                className="min-w-0 flex-1 rounded-full border border-white/15 bg-transparent px-5 py-3 text-sm text-cream placeholder:text-cream-dim focus:border-white/40 focus:outline-none light:border-ink/15 light:text-ink light:placeholder:text-ink-dim light:focus:border-ink/40"
              />
              <Button type="submit" variant="accent" disabled={isSearching || !query.trim()}>
                {isSearching ? "..." : "Buscar"}
              </Button>
            </form>
            {hasSearched && results.length === 0 && (
              <p className="mb-3 text-sm text-cream-dim opacity-70 light:text-ink-dim light:opacity-100">Nenhum outro local encontrado.</p>
            )}
            {results.length > 0 && (
              <ul className="mb-3 flex max-h-56 flex-col overflow-y-auto rounded-2xl border border-white/10 light:border-line">
                {results.map((location) => (
                  <li key={location.id}>
                    <button
                      type="button"
                      onClick={() => setTarget(location)}
                      className="block w-full px-4 py-2.5 text-left text-sm hover:bg-white/5 light:hover:bg-black/5"
                    >
                      {location.name} <span className="text-cream-dim light:text-ink-dim">— {location.city}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}

        {error && <p className="mb-3 text-sm text-sun-deep">{error}</p>}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full border border-white/15 px-5 py-2.5 text-sm font-medium opacity-85 hover:opacity-100 light:border-ink/15"
          >
            Cancelar
          </button>
          {target && (
            <button
              type="button"
              onClick={handleMerge}
              disabled={isMerging}
              className="rounded-full bg-sun-deep px-5 py-2.5 text-sm font-bold text-white transition-transform hover:-translate-y-0.5 disabled:opacity-60 disabled:hover:translate-y-0"
            >
              {isMerging ? "Mesclando..." : "Mesclar"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
