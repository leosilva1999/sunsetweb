import SearchBar from "@/components/ui/SearchBar";
import LocationCard from "@/components/location/LocationCard";
import { searchLocations } from "@/lib/api/locations";
import type { Location } from "@/types/location";

export default async function LocationsPage({ searchParams }: PageProps<"/locations">) {
  const { q: rawQ } = await searchParams;
  const q = typeof rawQ === "string" ? rawQ : undefined;

  let locations: Location[];
  let error: string | null = null;
  try {
    locations = (await searchLocations({ q })).items;
  } catch {
    locations = [];
    error = "Não foi possível carregar os locais agora. Tente novamente em instantes.";
  }

  return (
    <div className="px-[5vw] py-32">
      <h1 className="mb-6 font-display text-3xl font-semibold">Explorar locais</h1>
      <SearchBar defaultValue={q ?? ""} />

      <div className="mt-10">
        {error && <p className="text-sm text-cream-dim opacity-70 light:text-ink-dim light:opacity-100">{error}</p>}
        {!error && locations.length === 0 && (
          <p className="text-sm text-cream-dim opacity-70 light:text-ink-dim light:opacity-100">Nenhum local encontrado.</p>
        )}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {locations.map((location) => (
            <LocationCard key={location.id} location={location} />
          ))}
        </div>
      </div>
    </div>
  );
}
