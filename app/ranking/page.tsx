import { Suspense } from "react";
import CityRankingList from "@/components/city/CityRankingList";
import RankingList from "@/components/location/RankingList";
import RankingFilters from "@/components/location/RankingFilters";
import { getCity, getCityRanking } from "@/lib/api/cities";
import { getLocationRanking } from "@/lib/api/locations";
import { parseBrazilState } from "@/lib/utils/brazilStates";
import { buildPageMetadata } from "@/lib/utils/shareMetadata";
import type { Metadata } from "next";
import type { CityRankingItem } from "@/types/city";
import type { Location } from "@/types/location";

// Visão, período, estado e cidade (?view, ?period, ?state, ?city) mudam só o conteúdo; o
// canonical aponta sempre pra /ranking.
export const metadata: Metadata = buildPageMetadata({
  title: "Ranking dos melhores locais para ver o pôr do sol",
  description: "Os locais de pôr do sol mais bem avaliados da semana, do mês e de todos os tempos, segundo quem já foi.",
  path: "/ranking",
});

const mutedClass = "text-sm text-cream-dim opacity-70 light:text-ink-dim light:opacity-100";

export default async function RankingPage({ searchParams }: PageProps<"/ranking">) {
  const { period: rawPeriod, view: rawView, state: rawState, city: rawCity } = await searchParams;
  const period = rawPeriod === "month" || rawPeriod === "all" ? rawPeriod : "week";
  const view = rawView === "cities" ? "cities" : "locations";
  const state = parseBrazilState(rawState);
  const citySlug = typeof rawCity === "string" && /^[a-z0-9-]{1,120}$/.test(rawCity) ? rawCity : undefined;

  let locations: Location[] = [];
  let cities: CityRankingItem[] = [];
  let cityName: string | undefined;
  let loadError = false;
  try {
    if (view === "cities") {
      cities = await getCityRanking(period);
    } else {
      // Slug desconhecido faz o ranking responder 404: cai na mensagem de erro abaixo.
      [locations, cityName] = await Promise.all([
        getLocationRanking(period, undefined, { state, citySlug }),
        citySlug ? getCity(citySlug).then((city) => city.name, () => undefined) : undefined,
      ]);
    }
  } catch {
    loadError = true;
  }

  const isEmpty = view === "cities" ? cities.length === 0 : locations.length === 0;

  return (
    <div className="px-[5vw] py-32">
      <h1 className="mb-6 font-display text-3xl font-semibold">{view === "cities" ? "Ranking de cidades" : "Ranking de locais"}</h1>
      <Suspense fallback={null}>
        <RankingFilters cityName={cityName} />
      </Suspense>
      {loadError ? (
        <p className={mutedClass}>Não foi possível carregar o ranking agora.</p>
      ) : isEmpty ? (
        <p className={mutedClass}>Nenhum local avaliado nesse período ainda.</p>
      ) : view === "cities" ? (
        <CityRankingList items={cities} />
      ) : (
        <RankingList locations={locations} />
      )}
    </div>
  );
}
