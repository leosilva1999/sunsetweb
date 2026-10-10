"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import LocationCard from "@/components/location/LocationCard";
import { searchLocations } from "@/lib/api/locations";
import { ApiError } from "@/lib/api/client";
import { getCurrentPosition, GeolocationFailure, type Coordinates } from "@/lib/utils/geolocation";
import type { Location } from "@/types/location";
import type { CursorPage } from "@/types/pagination";

interface LocationSearchProps {
  initialQuery: string;
  initialPage: CursorPage<Location>;
  initialError?: boolean;
  initialNearby?: boolean;
}

const DEBOUNCE_MS = 300;
const RATE_LIMIT_COOLDOWN_MS = 10_000;
const INITIAL_LOAD_ERROR = "Não foi possível carregar os locais agora. Tente novamente em instantes.";
const RADIUS_OPTIONS_KM = [10, 25, 50, 100];
const DEFAULT_RADIUS_KM = 50;

const GEO_ERROR_MESSAGES: Record<GeolocationFailure["reason"], string> = {
  unsupported: "Seu navegador não suporta geolocalização.",
  denied: "Permissão de localização negada. Libere o acesso nas configurações do navegador para buscar perto de você.",
  unavailable: "Não foi possível descobrir sua localização agora.",
  timeout: "Demorou demais para obter sua localização. Tente novamente.",
};

export default function LocationSearch({ initialQuery, initialPage, initialError, initialNearby }: LocationSearchProps) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [locations, setLocations] = useState(initialPage.items);
  const [cursor, setCursor] = useState(initialPage.nextCursor);
  const [hasMore, setHasMore] = useState(initialPage.hasMore);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(initialError ? INITIAL_LOAD_ERROR : null);
  const [rateLimitedUntil, setRateLimitedUntil] = useState(0);
  // Modo "perto de mim" == ter posição. Fica só no client (nunca na URL, só o flag `nearby=1`).
  const [position, setPosition] = useState<Coordinates | null>(null);
  const [radius, setRadius] = useState(DEFAULT_RADIUS_KM);
  // Começa true quando vem da home (`?nearby=1`): a ativação automática roda logo após a montagem.
  const [isLocating, setIsLocating] = useState(Boolean(initialNearby));
  const [geoError, setGeoError] = useState<string | null>(null);
  const isFirstRun = useRef(true);
  const requestIdRef = useRef(0);
  const autoActivatedRef = useRef(false);

  const isNearby = position !== null;

  const enableNearby = async () => {
    setIsLocating(true);
    setGeoError(null);
    try {
      setPosition(await getCurrentPosition());
    } catch (err) {
      setGeoError(GEO_ERROR_MESSAGES[err instanceof GeolocationFailure ? err.reason : "unavailable"]);
    } finally {
      setIsLocating(false);
    }
  };

  const disableNearby = () => {
    setPosition(null);
    setGeoError(null);
  };

  // Vindo da home (`?nearby=1`) ativa o modo sozinho, uma vez só.
  useEffect(() => {
    if (!initialNearby || autoActivatedRef.current) return;
    autoActivatedRef.current = true;
    void enableNearby();
  }, [initialNearby]);

  // Mantém a URL em sincronia (q + flag nearby). O flag fica enquanto a posição
  // ainda está sendo obtida, senão o replace apagaria o `nearby=1` vindo da home
  // antes da geolocalização responder.
  useEffect(() => {
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    if (position || isLocating) params.set("nearby", "1");
    const search = params.toString();
    if (search !== window.location.search.slice(1)) {
      router.replace(`/locations${search ? `?${search}` : ""}`, { scroll: false });
    }
  }, [query, position, isLocating, router]);

  // Evita refazer a busca inicial (o servidor já buscou essa primeira página) —
  // só reage a mudanças de `query`, posição ou raio feitas pelo usuário depois disso.
  // Qualquer mudança aqui recomeça da primeira página: o cursor da API só vale
  // pros mesmos q/lat/lng/radius que o geraram.
  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }

    const trimmed = query.trim();

    if (Date.now() < rateLimitedUntil) return;

    const requestId = ++requestIdRef.current;
    const timeoutId = setTimeout(async () => {
      setIsLoading(true);
      setError(null);
      try {
        const page = await searchLocations({
          q: trimmed || undefined,
          ...(position ? { lat: position.lat, lng: position.lng, radius } : {}),
        });
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
  }, [query, position, radius, rateLimitedUntil, router]);

  const loadMore = async () => {
    if (!cursor || isLoadingMore) return;
    const requestId = requestIdRef.current;
    setIsLoadingMore(true);
    try {
      const page = await searchLocations({
        q: query.trim() || undefined,
        cursor,
        ...(position ? { lat: position.lat, lng: position.lng, radius } : {}),
      });
      // Se os filtros mudaram durante a requisição, esta página é de outra busca.
      if (requestId !== requestIdRef.current) return;
      setLocations((prev) => [...prev, ...page.items]);
      setCursor(page.nextCursor);
      setHasMore(page.hasMore);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const largerRadius = RADIUS_OPTIONS_KM.find((option) => option > radius);

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

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={isNearby ? disableNearby : enableNearby}
          disabled={isLocating}
          aria-pressed={isNearby}
          className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors disabled:opacity-60 ${
            isNearby
              ? "border-sun-core bg-sun-core text-ink"
              : "border-white/20 hover:border-white/40 light:border-line light:hover:border-ink-dim"
          }`}
        >
          {isLocating ? "Localizando..." : "Perto de mim"}
        </button>
        {isNearby &&
          RADIUS_OPTIONS_KM.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setRadius(option)}
              aria-pressed={radius === option}
              className={`rounded-full border px-3 py-2 font-mono text-xs transition-colors ${
                radius === option
                  ? "border-sun-core text-sun-core light:border-sun-deep light:text-sun-deep"
                  : "border-white/15 opacity-70 hover:opacity-100 light:border-line"
              }`}
            >
              {option} km
            </button>
          ))}
      </div>
      {geoError && <p className="mt-3 text-sm text-sun-deep">{geoError}</p>}

      <div className="mt-10">
        {error && <p className="mb-4 text-sm text-sun-deep">{error}</p>}
        {!error && !isLoading && locations.length === 0 && (
          <p className="text-sm text-cream-dim opacity-70 light:text-ink-dim light:opacity-100">
            {isNearby ? `Nenhum local em até ${radius} km.` : "Nenhum local encontrado."}
            {isNearby && largerRadius && (
              <>
                {" "}
                <button onClick={() => setRadius(largerRadius)} className="font-medium text-sun-mid underline light:text-sun-deep">
                  Ampliar para {largerRadius} km
                </button>
              </>
            )}
          </p>
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
