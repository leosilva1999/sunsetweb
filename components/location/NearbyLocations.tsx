import LocationCard from "@/components/location/LocationCard";
import type { Location } from "@/types/location";

// "Outros lugares por perto": links internos entre locais próximos (cada um traz distanceKm).
export default function NearbyLocations({ locations }: { locations: Location[] }) {
  if (locations.length === 0) return null;

  return (
    <section>
      <h2 className="mt-14 mb-6 font-display text-2xl font-semibold">Outros lugares por perto</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {locations.map((location) => (
          <LocationCard key={location.id} location={location} />
        ))}
      </div>
    </section>
  );
}
