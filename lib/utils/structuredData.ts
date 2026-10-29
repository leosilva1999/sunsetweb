import { SITE_URL } from "@/lib/utils/siteUrl";
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

export function placeJsonLd(location: Pick<Location, "id" | "name" | "city" | "latitude" | "longitude">, images: string[] = []) {
  return {
    "@context": CONTEXT,
    "@type": "Place",
    name: location.name,
    url: url(`/locations/${location.id}`),
    address: { "@type": "PostalAddress", addressLocality: location.city },
    geo: { "@type": "GeoCoordinates", latitude: location.latitude, longitude: location.longitude },
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
    creator: { "@type": "Person", name: photo.userName, url: url(`/profile/${photo.userId}`) },
    contentLocation: {
      "@type": "Place",
      name: photo.locationName,
      address: { "@type": "PostalAddress", addressLocality: photo.city },
    },
  };
}
