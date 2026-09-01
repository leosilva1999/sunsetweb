import RankingList from "@/components/location/RankingList";
import { getLocationRanking } from "@/lib/api/locations";

export default async function RankingPage({ searchParams }: PageProps<"/ranking">) {
  const { period: rawPeriod } = await searchParams;
  const period = rawPeriod === "month" || rawPeriod === "all" ? rawPeriod : "week";

  const locations = await getLocationRanking(period).catch(() => []);

  return (
    <div className="px-[5vw] py-32">
      <h1 className="mb-10 font-display text-3xl font-semibold">Ranking de locais</h1>
      {locations.length === 0 ? (
        <p className="text-sm text-cream-dim opacity-70 light:text-ink-dim light:opacity-100">Não foi possível carregar o ranking agora.</p>
      ) : (
        <RankingList locations={locations} />
      )}
    </div>
  );
}
