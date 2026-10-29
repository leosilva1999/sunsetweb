import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getLocation, getLocationPhotos, getLocationRatings, getLocationSunset } from "@/lib/api/locations";
import { formatTime } from "@/lib/utils/formatDate";
import BackButton from "@/components/ui/BackButton";
import PhotoGrid from "@/components/photo/PhotoGrid";
import LocationRatings from "@/components/location/LocationRatings";
import LocationMap from "@/components/location/LocationMap";
import LocationReportButton from "@/components/location/LocationReportButton";
import LocationModerationBar from "@/components/moderation/LocationModerationBar";
import JsonLd from "@/components/seo/JsonLd";
import { buildPageMetadata } from "@/lib/utils/shareMetadata";
import { breadcrumbJsonLd, placeJsonLd } from "@/lib/utils/structuredData";

export async function generateMetadata({ params }: PageProps<"/locations/[id]">): Promise<Metadata> {
  const { id } = await params;
  try {
    // Mesma chamada que a página faz (getLocationPhotos(id)), então o Next reaproveita a
    // resposta em vez de ir à API duas vezes.
    const [location, photos] = await Promise.all([
      getLocation(id),
      getLocationPhotos(id).catch(() => null),
    ]);
    const rating = location.avgRating > 0 ? ` Nota média ${location.avgRating.toFixed(1)} de 5.` : "";
    return buildPageMetadata({
      title: `Pôr do sol em ${location.name}, ${location.city}`,
      description: `Veja fotos e avaliações do pôr do sol em ${location.name}, ${location.city}.${rating}`,
      path: `/locations/${id}`,
      // Prévia com uma foto do próprio local; sem fotos, cai no logo.
      image: photos?.items[0]?.imageUrl,
    });
  } catch {
    return { title: "Local" };
  }
}

export default async function LocationDetailPage({ params }: PageProps<"/locations/[id]">) {
  const { id } = await params;

  const [location, photos, ratings, sunset] = await Promise.all([
    getLocation(id).catch(() => null),
    getLocationPhotos(id).catch(() => ({ items: [], nextCursor: null, hasMore: false })),
    getLocationRatings(id).catch(() => ({ items: [], nextCursor: null, hasMore: false })),
    // sunrise-sunset.org é um serviço externo — indisponibilidade dele não pode
    // derrubar a página do local, só omitir esse bloco.
    getLocationSunset(id).catch(() => null),
  ]);

  if (!location) {
    notFound();
  }

  return (
    <div className="px-[5vw] py-32">
      <JsonLd
        data={[
          placeJsonLd(location, photos.items.slice(0, 5).map((photo) => photo.imageUrl)),
          breadcrumbJsonLd([
            { name: "Início", path: "/" },
            { name: "Locais", path: "/locations" },
            { name: location.name, path: `/locations/${id}` },
          ]),
        ]}
      />
      <BackButton />

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

      {sunset && (
        <div className="mt-6 flex items-center gap-4 rounded-2xl border border-white/10 px-5 py-4 light:border-line light:bg-card">
          <svg viewBox="0 0 24 24" fill="none" stroke="var(--sun-core)" strokeWidth={2} className="h-8 w-8 shrink-0">
            <circle cx="12" cy="12" r="4" />
            <path d="M12 3v2M12 19v2M5 5l1.5 1.5M17.5 17.5 19 19M3 12h2M19 12h2M5 19l1.5-1.5M17.5 6.5 19 5" />
          </svg>
          <div>
            <p className="font-display text-lg font-semibold">Hoje o sol se põe às {formatTime(sunset.sunset, sunset.tzId)}</p>
            <p className="mt-1 font-mono text-xs text-cream-dim opacity-60 light:text-ink-dim light:opacity-100">
              Horário disponibilizado por:{" "}
              <a
                href="https://sunrise-sunset.org"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:opacity-80"
              >
                sunrise-sunset.org
              </a>
            </p>
          </div>
        </div>
      )}

      <h2 className="mt-14 mb-6 font-display text-2xl font-semibold">Onde fica</h2>
      <LocationMap latitude={location.latitude} longitude={location.longitude} name={location.name} />
      <div className="mt-4">
        <LocationReportButton locationId={id} />
      </div>
      <LocationModerationBar
        locationId={id}
        name={location.name}
        latitude={location.latitude}
        longitude={location.longitude}
      />

      <h2 className="mt-14 mb-6 font-display text-2xl font-semibold">Fotos do local</h2>
      {photos.items.length === 0 ? (
        <p className="text-sm text-cream-dim opacity-70 light:text-ink-dim light:opacity-100">Ainda não há fotos deste local.</p>
      ) : (
        <PhotoGrid items={photos.items} />
      )}

      <h2 className="mt-14 mb-6 font-display text-2xl font-semibold">Avaliações</h2>
      <LocationRatings locationId={id} initialPage={ratings} />
    </div>
  );
}
