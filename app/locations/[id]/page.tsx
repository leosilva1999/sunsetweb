import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getLocation, getLocationPhotos } from "@/lib/api/locations";
import PhotoGrid from "@/components/photo/PhotoGrid";

export async function generateMetadata({ params }: PageProps<"/locations/[id]">): Promise<Metadata> {
  const { id } = await params;
  try {
    const location = await getLocation(id);
    return {
      title: `${location.name} — Sunset`,
      description: `Veja fotos e avaliações do pôr do sol em ${location.name}, ${location.city}.`,
    };
  } catch {
    return { title: "Local — Sunset" };
  }
}

export default async function LocationDetailPage({ params }: PageProps<"/locations/[id]">) {
  const { id } = await params;

  const [location, photos] = await Promise.all([
    getLocation(id).catch(() => null),
    getLocationPhotos(id).catch(() => ({ items: [], nextCursor: null, hasMore: false })),
  ]);

  if (!location) {
    notFound();
  }

  return (
    <div className="px-[5vw] py-32">
      <span className="mb-2 block font-mono text-xs tracking-[0.14em] text-sun-mid uppercase light:text-sun-deep">
        {location.city}
      </span>
      <h1 className="mb-4 font-display text-4xl font-semibold">{location.name}</h1>
      <div className="flex items-center gap-2 font-mono text-sm text-cream-dim light:text-ink">
        {location.avgRating.toFixed(1)}
        <svg viewBox="0 0 24 24" fill="none" stroke="var(--sun-core)" strokeWidth={2} className="h-4 w-4">
          <polygon points="12 2 15 9 22 9.5 17 14.5 18.5 22 12 18 5.5 22 7 14.5 2 9.5 9 9" />
        </svg>
      </div>

      <h2 className="mt-14 mb-6 font-display text-2xl font-semibold">Fotos do local</h2>
      {photos.items.length === 0 ? (
        <p className="text-sm text-cream-dim opacity-70 light:text-ink-dim light:opacity-100">Ainda não há fotos deste local.</p>
      ) : (
        <PhotoGrid
          items={photos.items.map((photo) => ({
            photo,
            locationName: location.name,
            city: location.city,
          }))}
        />
      )}
    </div>
  );
}
