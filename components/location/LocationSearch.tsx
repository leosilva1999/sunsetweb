"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import LocationCard from "@/components/location/LocationCard";
import { searchLocations } from "@/lib/api/locations";
import { ApiError } from "@/lib/api/client";
import type { Location } from "@/types/location";
import type { CursorPage } from "@/types/pagination";

interface LocationSearchProps {
  initialQuery: string;
  initialPage: CursorPage<Location>;
  initialError?: boolean;
}

const DEBOUNCE_MS = 300;
const RATE_LIMIT_COOLDOWN_MS = 10_000;
const INITIAL_LOAD_ERROR = "Não foi possível carregar os locais agora. Tente novamente em instantes.";

export default function LocationSearch({ initialQuery, initialPage, initialError }: LocationSearchProps) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [locations, setLocations] = useState(initialPage.items);
  const [cursor, setCursor] = useState(initialPage.nextCursor);
  const [hasMore, setHasMore] = useState(initialPage.hasMore);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(initialError ? INITIAL_LOAD_ERROR : null);
  const [rateLimitedUntil, setRateLimitedUntil] = useState(0);
  const isFirstRun = useRef(true);
  const requestIdRef = useRef(0);

  // Evita refazer a busca inicial (o servidor já buscou essa primeira página) —
  // só reage a mudanças de `query` feitas pelo usuário depois disso.
  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }

    const trimmed = query.trim();
    router.replace(`/locations${trimmed ? `?q=${encodeURIComponent(trimmed)}` : ""}`, { scroll: false });

    if (Date.now() < rateLimitedUntil) return;

    const requestId = ++requestIdRef.current;
    const timeoutId = setTimeout(async () => {
      setIsLoading(true);
      setError(null);
      try {
        const page = await searchLocations({ q: trimmed || undefined });
        if (requestId === requestIdRef.current) {
          setLocations(page.items);
          setCursor(page.nextCursor);
          setHasMore(page.hasMore);
        }
      } catch (err) {
        if (requestId === requestIdRef.current) {
          if (err instanceof ApiError && err.status === 429) {
            setRateLimitedUntil(Date.now() + RATE_LIMIT_COOLDOWN_MS);
            setError("Muitas buscas seguidas — aguarde um instante.");
          } else {
            setError("Não foi possível buscar agora. Tente novamente.");
          }
        }
      } finally {
        if (requestId === requestIdRef.current) setIsLoading(false);
      }
    }, DEBOUNCE_MS);

    return () => clearTimeout(timeoutId);
  }, [query, rateLimitedUntil, router]);

  const loadMore = async () => {
    if (!cursor || isLoadingMore) return;
    setIsLoadingMore(true);
    try {
      const page = await searchLocations({ q: query.trim() || undefined, cursor });
      setLocations((prev) => [...prev, ...page.items]);
      setCursor(page.nextCursor);
      setHasMore(page.hasMore);
    } finally {
      setIsLoadingMore(false);
    }
  };

  return (
    <div>
      <form onSubmit={(event) => event.preventDefault()} className="max-w-xl">
        <input
          type="text"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Buscar por cidade, praia ou mirante..."
          className="w-full rounded-full bg-white/92 px-5 py-3.5 font-body text-[0.98rem] text-ink shadow-[0_12px_40px_rgba(21,10,38,0.15)] placeholder:text-[#8a7d6f] focus:outline-none"
        />
      </form>

      <div className="mt-10">
        {error && <p className="mb-4 text-sm text-sun-deep">{error}</p>}
        {!error && !isLoading && locations.length === 0 && (
          <p className="text-sm text-cream-dim opacity-70 light:text-ink-dim light:opacity-100">Nenhum local encontrado.</p>
        )}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {locations.map((location) => (
            <LocationCard key={location.id} location={location} />
          ))}
        </div>
        {hasMore && (
          <button
            onClick={loadMore}
            disabled={isLoadingMore}
            className="mt-6 text-sm font-medium text-sun-mid hover:opacity-80 light:text-sun-deep"
          >
            {isLoadingMore ? "Carregando..." : "Carregar mais"}
          </button>
        )}
      </div>
    </div>
  );
}
