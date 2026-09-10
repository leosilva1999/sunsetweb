import { Suspense } from "react";
import RankingList from "@/components/location/RankingList";
import RankingPeriodTabs from "@/components/location/RankingPeriodTabs";
import { getLocationRanking } from "@/lib/api/locations";
import type { Location } from "@/types/location";

export default async function RankingPage({ searchParams }: PageProps<"/ranking">) {
  const { period: rawPeriod } = await searchParams;
  const period = rawPeriod === "month" || rawPeriod === "all" ? rawPeriod : "week";

  let locations: Location[] = [];
  let loadError = false;
  try {
    locations = await getLocationRanking(period);
  } catch {
    loadError = true;
  }

  return (
    <div className="px-[5vw] py-32">
      <h1 className="mb-6 font-display text-3xl font-semibold">Ranking de locais</h1>
      <Suspense fallback={null}>
        <RankingPeriodTabs />
      </Suspense>
      {loadError ? (
        <p className="text-sm text-cream-dim opacity-70 light:text-ink-dim light:opacity-100">Não foi possível carregar o ranking agora.</p>
      ) : locations.length === 0 ? (
        <p className="text-sm text-cream-dim opacity-70 light:text-ink-dim light:opacity-100">
          Nenhum local avaliado nesse período ainda.
        </p>
      ) : (
        <RankingList locations={locations} />
      )}
    </div>
  );
}
