import type { Metadata } from "next";
import LocationSearch from "@/components/location/LocationSearch";
import { searchLocations } from "@/lib/api/locations";
import { buildPageMetadata } from "@/lib/utils/shareMetadata";
import type { CursorPage } from "@/types/pagination";
import type { Location } from "@/types/location";

// Buscas (?q=) e "perto de mim" (?nearby=) mudam só o conteúdo; o canonical é sempre /locations.
export const metadata: Metadata = buildPageMetadata({
  title: "Explorar locais de pôr do sol",
  description: "Pesquise por cidade, praia ou mirante e encontre os melhores locais para ver o pôr do sol, com fotos e avaliações.",
  path: "/locations",
});

export default async function LocationsPage({ searchParams }: PageProps<"/locations">) {
  const { q: rawQ, nearby } = await searchParams;
  const q = typeof rawQ === "string" ? rawQ : undefined;

  let initialPage: CursorPage<Location>;
  let initialError = false;
  try {
    initialPage = await searchLocations({ q });
  } catch {
    initialPage = { items: [], nextCursor: null, hasMore: false };
    initialError = true;
  }

  return (
    <div className="px-[5vw] py-32">
      <h1 className="mb-6 font-display text-3xl font-semibold">Explorar locais</h1>
      <LocationSearch initialQuery={q ?? ""} initialNearby={nearby === "1"} initialPage={initialPage} initialError={initialError} />
    </div>
  );
}
