"use client";

import { useRouter, useSearchParams } from "next/navigation";
import Tabs from "@/components/ui/Tabs";
import { BRAZIL_STATES, parseBrazilState } from "@/lib/utils/brazilStates";

const PERIOD_OPTIONS: { label: string; value: "week" | "month" | "all" }[] = [
  { label: "Semana", value: "week" },
  { label: "Mês", value: "month" },
  { label: "Sempre", value: "all" },
];
const VIEW_OPTIONS: { label: string; value: "locations" | "cities" }[] = [
  { label: "Locais", value: "locations" },
  { label: "Cidades", value: "cities" },
];

interface RankingFiltersProps {
  // Nome da cidade filtrada (?city=slug), pra mostrar o chip; vem do servidor.
  cityName?: string;
}

// Visão (locais/cidades), período, estado e cidade vivem na URL (?view, ?period, ?state, ?city):
// a página é renderizada no servidor a partir deles e cada combinação é linkável.
export default function RankingFilters({ cityName }: RankingFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const rawPeriod = searchParams.get("period");
  const period = rawPeriod === "month" || rawPeriod === "all" ? rawPeriod : "week";
  const view = searchParams.get("view") === "cities" ? "cities" : "locations";
  const state = parseBrazilState(searchParams.get("state")) ?? "";
  const citySlug = searchParams.get("city");

  const update = (changes: Record<string, string | null>) => {
    const next = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(changes)) {
      if (value) next.set(key, value);
      else next.delete(key);
    }
    const query = next.toString();
    router.push(query ? `/ranking?${query}` : "/ranking");
  };

  const activeView = VIEW_OPTIONS.find((option) => option.value === view)!;
  const activePeriod = PERIOD_OPTIONS.find((option) => option.value === period)!;

  return (
    <div className="mb-9">
      <Tabs
        options={VIEW_OPTIONS.map((option) => option.label)}
        active={activeView.label}
        onChange={(label) => update({ view: label === "Cidades" ? "cities" : null })}
      />
      <Tabs
        options={PERIOD_OPTIONS.map((option) => option.label)}
        active={activePeriod.label}
        onChange={(label) => update({ period: PERIOD_OPTIONS.find((option) => option.label === label)?.value ?? null })}
      />
      {/* O ranking de cidades é nacional; estado e cidade só filtram o ranking de locais. */}
      {view === "locations" && (
        <div className="-mt-4 flex flex-wrap items-center gap-3">
          <select
            value={state}
            onChange={(event) => update({ state: event.target.value || null })}
            aria-label="Filtrar por estado"
            className="rounded-full border border-white/15 bg-transparent px-4 py-2 text-sm focus:outline-none light:border-line"
          >
            <option value="">Todos os estados</option>
            {BRAZIL_STATES.map((uf) => (
              <option key={uf} value={uf}>
                {uf}
              </option>
            ))}
          </select>
          {citySlug && (
            <button
              type="button"
              onClick={() => update({ city: null })}
              className="rounded-full border border-sun-mid/50 px-4 py-2 text-sm text-sun-mid hover:bg-sun-mid/10 light:border-sun-deep/50 light:text-sun-deep"
            >
              {cityName ?? citySlug} ✕
            </button>
          )}
        </div>
      )}
    </div>
  );
}
