import { SITE_URL } from "@/lib/utils/siteUrl";
import { locationPath } from "@/lib/utils/locationPath";
import { cityPath } from "@/lib/utils/cityPath";
import type { CityDetail } from "@/types/city";
import type { Location } from "@/types/location";
import type { Photo } from "@/types/photo";

const CONTEXT = "https://schema.org";
const url = (path: string) => `${SITE_URL}${path}`;

export function websiteJsonLd() {
  return {
    "@context": CONTEXT,
    "@type": "WebSite",
    name: "Sunsetsss",
    url: SITE_URL,
    inLanguage: "pt-BR",
  };
}

export function organizationJsonLd() {
  return {
    "@context": CONTEXT,
    "@type": "Organization",
    name: "Sunsetsss",
    url: SITE_URL,
    logo: url("/images/logo-vertical.png"),
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": CONTEXT,
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: url(item.path),
    })),
  };
}

type PlaceLocation = Pick<
  Location,
  "slug" | "name" | "city" | "cityName" | "state" | "latitude" | "longitude" | "description" | "avgRating" | "ratingsCount"
>;

export function placeJsonLd(location: PlaceLocation, images: string[] = []) {
  return {
    "@context": CONTEXT,
    "@type": "Place",
    name: location.name,
    url: url(locationPath(location)),
    ...(location.description ? { description: location.description } : {}),
    address: {
      "@type": "PostalAddress",
      addressLocality: location.cityName ?? location.city,
      ...(location.state ? { addressRegion: location.state } : {}),
      addressCountry: "BR",
    },
    geo: { "@type": "GeoCoordinates", latitude: location.latitude, longitude: location.longitude },
    ...(images.length > 0 ? { image: images } : {}),
    // Só com avaliações de verdade: nota sem contagem (ou 0 estrelas) não é dado válido.
    ...(location.ratingsCount > 0 && location.avgRating > 0
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: location.avgRating,
            ratingCount: location.ratingsCount,
            bestRating: 5,
            worstRating: 1,
          },
        }
      : {}),
  };
}

// Município vira "City"; localidade (praia, distrito...) fica como "Place" dentro do município.
export function cityJsonLd(city: CityDetail, images: string[] = []) {
  return {
    "@context": CONTEXT,
    "@type": city.kind === "Municipality" ? "City" : "Place",
    name: city.name,
    url: url(cityPath(city)),
    geo: { "@type": "GeoCoordinates", latitude: city.latitude, longitude: city.longitude },
    address: {
      "@type": "PostalAddress",
      addressLocality: city.parent?.name ?? city.name,
      addressRegion: city.state,
      addressCountry: city.country,
    },
    ...(city.parent
      ? { containedInPlace: { "@type": "City", name: city.parent.name, url: url(cityPath(city.parent)) } }
      : {}),
    ...(images.length > 0 ? { image: images } : {}),
  };
}

export function photoJsonLd(photo: Photo) {
  return {
    "@context": CONTEXT,
    "@type": "ImageObject",
    contentUrl: photo.imageUrl,
    url: url(`/photos/${photo.id}`),
    name: photo.caption || `Pôr do sol em ${photo.locationName}, ${photo.city}`,
    ...(photo.caption ? { caption: photo.caption } : {}),
    description: `Pôr do sol em ${photo.locationName}, ${photo.city}, por ${photo.userName}.`,
    uploadDate: photo.createdAt,
    ...(photo.width && photo.height ? { width: photo.width, height: photo.height } : {}),
    creator: { "@type": "Person", name: photo.userName, url: url(`/profile/${photo.userId}`) },
    contentLocation: {
      "@type": "Place",
      name: photo.locationName,
      address: { "@type": "PostalAddress", addressLocality: photo.city },
    },
  };
}
