import LocationSearch from "@/components/location/LocationSearch";
import { searchLocations } from "@/lib/api/locations";
import type { CursorPage } from "@/types/pagination";
import type { Location } from "@/types/location";

export default async function LocationsPage({ searchParams }: PageProps<"/locations">) {
  const { q: rawQ } = await searchParams;
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
      <LocationSearch initialQuery={q ?? ""} initialPage={initialPage} initialError={initialError} />
    </div>
  );
}
