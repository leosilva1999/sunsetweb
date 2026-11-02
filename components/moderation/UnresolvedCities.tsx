"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import CityPicker from "@/components/city/CityPicker";
import { useAuth } from "@/lib/hooks/useAuth";
import { getUnresolvedCityLocations, updateLocationCity } from "@/lib/api/moderation";
import { ApiError } from "@/lib/api/client";
import { cityLabel, type CityOption } from "@/lib/utils/cityLabel";
import { locationPath } from "@/lib/utils/locationPath";
import type { UnresolvedCityItem, UnresolvedCityReason } from "@/types/city";

const REASON_TEXT: Record<UnresolvedCityReason, string> = {
  match: "Um município do catálogo combina com o texto.",
  ambiguous: "Vários municípios têm esse nome e o pino não decide. Escolha um.",
  locality: "Só uma localidade tem esse nome. Confirmar muda a cidade exibida.",
  none: "Nada no catálogo combina. Busque a cidade abaixo.",
};

const chipClass =
  "rounded-full border border-sun-mid/50 px-4 py-2 text-xs font-medium text-sun-mid hover:bg-sun-mid/10 disabled:opacity-50 light:border-sun-deep/50 light:text-sun-deep";

// Fila de locais cujo texto de cidade o sistema não casou com segurança com o catálogo.
export default function UnresolvedCities() {
  const { getAccessToken } = useAuth();
  const [items, setItems] = useState<UnresolvedCityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
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
        const result = await getUnresolvedCityLocations(token, 50);
        if (!cancelled) setItems(result);
      } catch {
        if (!cancelled) setError("Não foi possível carregar a fila agora.");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [getAccessToken]);

  const handleAssign = async (item: UnresolvedCityItem, city: CityOption) => {
    setBusyId(item.location.id);
    setError(null);
    try {
      const token = await getAccessToken();
      if (!token) {
        setError("Sua sessão expirou. Entre novamente.");
        return;
      }
      await updateLocationCity(item.location.id, city.id, token);
      setItems((prev) => prev.filter((i) => i.location.id !== item.location.id));
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) {
        setItems((prev) => prev.filter((i) => i.location.id !== item.location.id));
        setError("Este local não existe mais.");
      } else if (err instanceof ApiError && err.status === 400) {
        setError("Essa cidade não está disponível no catálogo.");
      } else {
        setError("Não foi possível salvar agora. Tente novamente.");
      }
    } finally {
      setBusyId(null);
    }
  };

  if (isLoading) {
    return <p className="text-sm text-cream-dim opacity-70 light:text-ink-dim light:opacity-100">Carregando...</p>;
  }

  return (
    <div>
      {error && <p className="mb-4 text-sm text-sun-deep">{error}</p>}
      {items.length === 0 ? (
        <p className="text-sm text-cream-dim opacity-70 light:text-ink-dim light:opacity-100">Nenhum local esperando cidade.</p>
      ) : (
        <ul className="flex flex-col gap-4">
          {items.map((item) => {
            const isBusy = busyId === item.location.id;
            const options: { key: string; label: string; city: CityOption }[] = [];
            if (item.reason === "match" && item.suggestedCity) {
              options.push({ key: item.suggestedCity.id, label: `Confirmar ${cityLabel(item.suggestedCity)}`, city: item.suggestedCity });
            }
            if (item.reason === "locality" && item.suggestedLocality) {
              const target = item.suggestedCity ? ` (cidade: ${item.suggestedCity.name})` : "";
              options.push({
                key: item.suggestedLocality.id,
                label: `Confirmar ${cityLabel(item.suggestedLocality)}${target}`,
                city: item.suggestedLocality,
              });
            }
            if (item.reason === "ambiguous") {
              for (const candidate of item.candidates) {
                options.push({ key: candidate.id, label: cityLabel(candidate), city: candidate });
              }
            }

            return (
              <li key={item.location.id} className="rounded-2xl border border-white/10 p-4 light:border-line">
                <p className="font-medium">
                  <Link href={locationPath(item.location)} className="underline-offset-2 hover:underline">
                    {item.location.name}
                  </Link>{" "}
                  <span className="font-normal text-cream-dim light:text-ink-dim">— texto: “{item.location.city}”</span>
                </p>
                <p className="mt-1 text-xs text-cream-dim opacity-80 light:text-ink-dim light:opacity-100">{REASON_TEXT[item.reason]}</p>
                {options.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {options.map((option) => (
                      <button
                        key={option.key}
                        type="button"
                        disabled={isBusy}
                        onClick={() => handleAssign(item, option.city)}
                        className={chipClass}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                )}
                <div className="mt-3">
                  <p className="mb-1 text-xs text-cream-dim opacity-70 light:text-ink-dim light:opacity-100">Ou buscar outra cidade:</p>
                  <CityPicker value={null} onSelect={(city) => handleAssign(item, city)} />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
