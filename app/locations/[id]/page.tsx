import DisplayAd from "@/components/ads/DisplayAd";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { getLocation, getLocationPhotos, getLocationRatings, getLocationSunset, getNearbyLocations } from "@/lib/api/locations";
import BackButton from "@/components/ui/BackButton";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import SunsetTimeCard from "@/components/location/SunsetTimeCard";
import NearbyLocations from "@/components/location/NearbyLocations";
import PhotoGrid from "@/components/photo/PhotoGrid";
import LocationRatings from "@/components/location/LocationRatings";
import LocationMap from "@/components/location/LocationMap";
import LocationReportButton from "@/components/location/LocationReportButton";
import LocationModerationBar from "@/components/moderation/LocationModerationBar";
import JsonLd from "@/components/seo/JsonLd";
import { buildPageMetadata } from "@/lib/utils/shareMetadata";
import { breadcrumbJsonLd, placeJsonLd } from "@/lib/utils/structuredData";
import { locationPath } from "@/lib/utils/locationPath";
import { cityPath } from "@/lib/utils/cityPath";
import { categoryLabel } from "@/lib/utils/locationCategory";

// Página em cache por 60 s (ISR); quando a API avisa uma mudança, POST /api/revalidate
// invalida na hora pelas tags dos fetches.
export const revalidate = 60;

export async function generateMetadata({ params }: PageProps<"/locations/[id]">): Promise<Metadata> {
  // O segmento da URL é o slug (ou o GUID, de links antigos: a página redireciona pro slug).
  const { id: idOrSlug } = await params;
  try {
    // Mesmas chamadas que a página faz, então o Next reaproveita as respostas em vez de ir
    // à API duas vezes.
    const location = await getLocation(idOrSlug);
    const photos = await getLocationPhotos(location.id).catch(() => null);
    const rating = location.avgRating > 0 ? ` Nota média ${location.avgRating.toFixed(1)} de 5.` : "";
    return buildPageMetadata({
      title: `Pôr do sol em ${location.name}, ${location.city}`,
      description: `Veja fotos e avaliações do pôr do sol em ${location.name}, ${location.city}.${rating}`,
      path: locationPath(location),
      // Prévia com uma foto do próprio local; sem fotos, cai no logo.
      image: photos?.items[0]?.imageUrl,
    });
  } catch {
    return { title: "Local" };
  }
}

export default async function LocationDetailPage({ params }: PageProps<"/locations/[id]">) {
  const { id: idOrSlug } = await params;

  const location = await getLocation(idOrSlug).catch(() => null);
  if (!location) {
    notFound();
  }

  // Um endereço só por local: o GUID (links e buscas antigos) e variações de caixa do slug
  // vão pro slug canônico com redirect permanente, pra o Google juntar tudo numa URL.
  if (idOrSlug !== location.slug) {
    permanentRedirect(locationPath(location));
  }

  // As demais rotas do local são por id.
  const id = location.id;
  const [photos, ratings, sunset, nearby] = await Promise.all([
    getLocationPhotos(id).catch(() => ({ items: [], nextCursor: null, hasMore: false })),
    getLocationRatings(id).catch(() => ({ items: [], nextCursor: null, hasMore: false })),
    // sunrise-sunset.org é um serviço externo — indisponibilidade dele não pode
    // derrubar a página do local, só omitir esse bloco.
    getLocationSunset(id).catch(() => null),
    getNearbyLocations(id, undefined, 6).catch(() => []),
  ]);

  // Trilha até a cidade (e a localidade, quando há): links internos pras páginas de cidade e,
  // sem cidade no catálogo, a trilha antiga por "Locais".
  const crumbs = [
    { name: "Início", href: "/" },
    ...(location.citySlug && location.cityName
      ? [
          { name: "Cidades", href: "/cidades" },
          { name: location.cityName, href: cityPath({ slug: location.citySlug }) },
          ...(location.localitySlug && location.localityName
            ? [{ name: location.localityName, href: cityPath({ slug: location.localitySlug }) }]
            : []),
        ]
      : [{ name: "Locais", href: "/locations" }]),
    { name: location.name },
  ];

  return (
    <div className="px-[5vw] py-32">
      <JsonLd
        data={[
          placeJsonLd(location, photos.items.slice(0, 5).map((photo) => photo.imageUrl)),
          breadcrumbJsonLd(crumbs.map((crumb) => ({ name: crumb.name, path: crumb.href ?? locationPath(location) }))),
        ]}
      />
      <BackButton />
      <Breadcrumbs items={crumbs} />

      <span className="mb-2 block font-mono text-xs tracking-[0.14em] text-sun-mid uppercase light:text-sun-deep">
        {location.citySlug ? (
          <Link href={cityPath({ slug: location.citySlug })} className="hover:underline">
            {location.city}
          </Link>
        ) : (
          location.city
        )}
        {location.category && ` · ${categoryLabel(location.category)}`}
      </span>
      <h1 className="mb-4 font-display text-4xl font-semibold">{location.name}</h1>
      <div className="flex items-center gap-2 font-mono text-sm text-cream-dim light:text-ink">
        {location.avgRating.toFixed(1)}
        <svg viewBox="0 0 24 24" fill="none" stroke="var(--sun-core)" strokeWidth={2} className="h-4 w-4">
          <polygon points="12 2 15 9 22 9.5 17 14.5 18.5 22 12 18 5.5 22 7 14.5 2 9.5 9 9" />
        </svg>
      </div>

      {location.description && (
        <p className="mt-4 max-w-2xl whitespace-pre-line text-cream-dim light:text-ink-dim">{location.description}</p>
      )}

      {sunset && (
        <div className="mt-6">
          <SunsetTimeCard sunset={sunset} />
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
        description={location.description}
        category={location.category}
      />

      <h2 className="mt-14 mb-6 font-display text-2xl font-semibold">Fotos do local</h2>
      {photos.items.length === 0 ? (
        <p className="text-sm text-cream-dim opacity-70 light:text-ink-dim light:opacity-100">Ainda não há fotos deste local.</p>
      ) : (
        <PhotoGrid items={photos.items} />
      )}

      <DisplayAd className="mt-14" />

      <h2 className="mt-14 mb-6 font-display text-2xl font-semibold">Avaliações</h2>
      <LocationRatings locationId={id} initialPage={ratings} />

      <NearbyLocations locations={nearby} />
    </div>
  );
}
