"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/hooks/useAuth";
import { getDeletedLocations, restoreLocation } from "@/lib/api/moderation";
import { ApiError } from "@/lib/api/client";
import { formatDate } from "@/lib/utils/formatDate";
import type { DeletedLocation } from "@/types/location";

export default function DeletedLocations() {
  const { getAccessToken } = useAuth();
  const [locations, setLocations] = useState<DeletedLocation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [restoringId, setRestoringId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      try {
        const token = await getAccessToken();
        if (!token) {
          if (!cancelled) setError("Sua sessão expirou. Entre novamente.");
          return;
        }
        const result = await getDeletedLocations(token);
        if (!cancelled) setLocations(result);
      } catch {
        if (!cancelled) setError("Não foi possível carregar os locais excluídos agora.");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [getAccessToken]);

  const handleRestore = async (location: DeletedLocation) => {
    setRestoringId(location.id);
    setError(null);
    try {
      const token = await getAccessToken();
      if (!token) {
        setError("Sua sessão expirou. Entre novamente.");
        return;
      }
      await restoreLocation(location.id, token);
      setLocations((prev) => prev.filter((l) => l.id !== location.id));
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        // Já foi restaurado por outra pessoa: some da lista também.
        setLocations((prev) => prev.filter((l) => l.id !== location.id));
        setError("Este local já tinha sido restaurado.");
      } else {
        setError("Não foi possível restaurar agora.");
      }
    } finally {
      setRestoringId(null);
    }
  };

  if (isLoading) {
    return <p className="text-sm text-cream-dim opacity-70 light:text-ink-dim light:opacity-100">Carregando...</p>;
  }

  return (
    <div>
      {error && <p className="mb-4 text-sm text-sun-deep">{error}</p>}

      {locations.length === 0 ? (
        <p className="text-sm text-cream-dim opacity-70 light:text-ink-dim light:opacity-100">Nenhum local excluído.</p>
      ) : (
        <>
          <p className="mb-4 text-xs text-cream-dim opacity-70 light:text-ink-dim light:opacity-100">
            Restaurar traz de volta o local e só as fotos que foram escondidas junto com ele. Locais mesclados em outro voltam vazios: as
            fotos continuam no local de destino.
          </p>
          <ul className="flex flex-col gap-3">
            {locations.map((location) => (
              <li key={location.id} className="flex flex-wrap items-center gap-3 rounded-2xl border border-white/10 p-4 light:border-line">
                <div className="flex-1">
                  <p className="font-medium">
                    {location.name} <span className="font-normal text-cream-dim light:text-ink-dim">— {location.city}</span>
                  </p>
                  <p className="font-mono text-xs text-cream-dim opacity-70 light:text-ink-dim light:opacity-100">
                    Excluído em {formatDate(location.deletedAt)}
                  </p>
                </div>
                <button
                  onClick={() => handleRestore(location)}
                  disabled={restoringId === location.id}
                  className="rounded-full bg-sun-core px-4 py-2 text-xs font-bold text-ink disabled:opacity-40"
                >
                  {restoringId === location.id ? "Restaurando..." : "Restaurar"}
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
