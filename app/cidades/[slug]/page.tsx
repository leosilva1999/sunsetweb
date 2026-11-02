import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import BackButton from "@/components/ui/BackButton";
import CityLocations from "@/components/city/CityLocations";
import CityPhotos from "@/components/city/CityPhotos";
import SunsetTimeCard from "@/components/location/SunsetTimeCard";
import JsonLd from "@/components/seo/JsonLd";
import { getCity, getCityLocations, getCityPhotos, getCitySunset } from "@/lib/api/cities";
import { cityPath, cityPlaceLabel } from "@/lib/utils/cityPath";
import { pluralize } from "@/lib/utils/pluralize";
import { buildPageMetadata } from "@/lib/utils/shareMetadata";
import { breadcrumbJsonLd, cityJsonLd } from "@/lib/utils/structuredData";
import type { CityDetail } from "@/types/city";

const EMPTY_PAGE = { items: [], nextCursor: null, hasMore: false };

// Página em cache por 60 s (ISR); quando a API avisa uma mudança, POST /api/revalidate
// invalida na hora pelas tags dos fetches.
export const revalidate = 60;

// "Imbituba - SC" (município) ou "Praia do Rosa, Imbituba - SC" (localidade).
function fullName(city: CityDetail): string {
  return city.parent ? `${city.name}, ${city.parent.name} - ${city.state}` : `${city.name} - ${city.state}`;
}

export async function generateMetadata({ params }: PageProps<"/cidades/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  try {
    const city = await getCity(slug);
    const rating = city.avgRating !== null ? ` Nota média ${city.avgRating.toFixed(1)} de 5.` : "";
    return buildPageMetadata({
      title: `Pôr do sol em ${fullName(city)}`,
      description: `${pluralize(city.locationsCount, "local", "locais")} e ${pluralize(city.photosCount, "foto", "fotos")} de pôr do sol em ${fullName(city)}.${rating}`,
      path: cityPath(city),
      image: city.coverImageUrl,
    });
  } catch {
    return { title: "Cidade" };
  }
}

export default async function CityPage({ params }: PageProps<"/cidades/[slug]">) {
  const { slug: requestedSlug } = await params;

  // 404 da API = slug desconhecido, cidade inativa ou sem local visível: sem página.
  const city = await getCity(requestedSlug).catch(() => null);
  if (!city) {
    notFound();
  }

  // Um endereço só por cidade: o slug é aceito sem diferenciar maiúsculas, mas a URL canônica
  // é a que a API devolve.
  if (requestedSlug !== city.slug) {
    permanentRedirect(cityPath(city));
  }

  const [locations, photos, sunset] = await Promise.all([
    getCityLocations(city.slug, "rating", undefined, 12).catch(() => EMPTY_PAGE),
    getCityPhotos(city.slug, "top", undefined, 13).catch(() => EMPTY_PAGE),
    // sunrise-sunset.org é um serviço externo: se cair, só omite o bloco.
    getCitySunset(city.slug).catch(() => null),
  ]);

  const crumbs = [
    { name: "Início", href: "/" },
    { name: "Cidades", href: "/cidades" },
    ...(city.parent ? [{ name: city.parent.name, href: cityPath(city.parent) }] : []),
    { name: city.name },
  ];

  return (
    <div className="px-[5vw] py-32">
      <JsonLd
        data={[
          cityJsonLd(city, photos.items.slice(0, 5).map((photo) => photo.imageUrl)),
          breadcrumbJsonLd(
            crumbs.map((crumb) => ({ name: crumb.name, path: crumb.href ?? cityPath(city) })),
          ),
        ]}
      />
      <BackButton />
      <Breadcrumbs items={crumbs} />

      <span className="mb-2 block font-mono text-xs tracking-[0.14em] text-sun-mid uppercase light:text-sun-deep">
        {city.parent ? `Localidade · ${cityPlaceLabel(city)}` : `Município · ${city.state}`}
      </span>
      <h1 className="mb-4 font-display text-4xl font-semibold">Pôr do sol em {city.name}</h1>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-sm text-cream-dim light:text-ink">
        <span>{pluralize(city.locationsCount, "local", "locais")}</span>
        <span>{pluralize(city.photosCount, "foto", "fotos")}</span>
        <span>{pluralize(city.ratingsCount, "avaliação", "avaliações")}</span>
        {city.avgRating !== null && (
          <span className="flex items-center gap-1.5">
            {city.avgRating.toFixed(1)}
            <svg viewBox="0 0 24 24" fill="none" stroke="var(--sun-core)" strokeWidth={2} className="h-4 w-4">
              <polygon points="12 2 15 9 22 9.5 17 14.5 18.5 22 12 18 5.5 22 7 14.5 2 9.5 9 9" />
            </svg>
          </span>
        )}
      </div>

      {city.topLocation && (
        <p className="mt-4 max-w-2xl text-sm text-cream-dim light:text-ink-dim">
          O local mais bem avaliado em {city.name} é{" "}
          <Link href={`/locations/${city.topLocation.id}`} className="font-medium underline">
            {city.topLocation.name}
          </Link>
          {city.topLocation.avgRating > 0 && ` (nota ${city.topLocation.avgRating.toFixed(1)} de 5)`}.
        </p>
      )}

      {sunset && (
        <div className="mt-6 max-w-xl">
          <SunsetTimeCard sunset={sunset} />
        </div>
      )}

      {city.localities.length > 0 && (
        <section>
          <h2 className="mt-14 mb-4 font-display text-2xl font-semibold">Praias, bairros e povoados em {city.name}</h2>
          <ul className="flex flex-wrap gap-2.5">
            {city.localities.map((locality) => (
              <li key={locality.slug}>
                <Link
                  href={cityPath(locality)}
                  className="block rounded-full border border-white/15 px-4 py-2 text-sm hover:border-white/40 light:border-ink/15 light:hover:border-ink/40"
                >
                  {locality.name}{" "}
                  <span className="font-mono text-xs text-cream-dim opacity-70 light:text-ink-dim light:opacity-100">
                    · {pluralize(locality.locationsCount, "local", "locais")}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <h2 className="mt-14 mb-6 font-display text-2xl font-semibold">Locais em {city.name}</h2>
      {locations.items.length === 0 ? (
        <p className="text-sm text-cream-dim opacity-70 light:text-ink-dim light:opacity-100">Não foi possível carregar os locais agora.</p>
      ) : (
        <CityLocations slug={city.slug} initialPage={locations} />
      )}
      <p className="mt-6 text-sm">
        <Link href={`/ranking?city=${city.slug}&period=all`} className="font-medium text-sun-mid hover:opacity-80 light:text-sun-deep">
          Ver o ranking de {city.name}
        </Link>
      </p>

      {photos.items.length > 0 && (
        <>
          <h2 className="mt-14 mb-6 font-display text-2xl font-semibold">Fotos de {city.name}</h2>
          <CityPhotos slug={city.slug} initialPage={photos} />
        </>
      )}
    </div>
  );
}
