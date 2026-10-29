import { Suspense } from "react";
import RankingList from "@/components/location/RankingList";
import RankingPeriodTabs from "@/components/location/RankingPeriodTabs";
import { getLocationRanking } from "@/lib/api/locations";
import { buildPageMetadata } from "@/lib/utils/shareMetadata";
import type { Metadata } from "next";
import type { Location } from "@/types/location";

// O período (?period=) muda só o conteúdo; o canonical aponta sempre pra /ranking.
export const metadata: Metadata = buildPageMetadata({
  title: "Ranking dos melhores locais para ver o pôr do sol",
  description: "Os locais de pôr do sol mais bem avaliados da semana, do mês e de todos os tempos, segundo quem já foi.",
  path: "/ranking",
});

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
