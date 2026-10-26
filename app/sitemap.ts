import type { MetadataRoute } from "next";
import { searchLocations } from "@/lib/api/locations";
import { getPhotos } from "@/lib/api/photos";
import { SITE_URL } from "@/lib/utils/siteUrl";
import { logger } from "@/lib/utils/logger";
import type { CursorPage } from "@/types/pagination";

// Sem isso o sitemap seria gerado uma vez no build e nunca mais refletiria
// locais/fotos novos.
export const revalidate = 3600;

// A API limita cada página a 50 itens e GET /locations tem rate limit (40 req/10s por
// IP) — o teto de páginas mantém o sitemap dentro disso. Passando dele, o sitemap
// fica truncado (o aviso no log deixa isso visível).
const PAGE_SIZE = 50;
const MAX_PAGES = 20;

async function collectAll<T>(
  label: string,
  fetchPage: (cursor?: string) => Promise<CursorPage<T>>,
): Promise<T[]> {
  const items: T[] = [];
  let cursor: string | undefined;

  try {
    for (let page = 0; page < MAX_PAGES; page++) {
      const result = await fetchPage(cursor);
      items.push(...result.items);
      if (!result.hasMore || !result.nextCursor) return items;
      cursor = result.nextCursor;
    }
    logger.warn("Sitemap truncado: há mais itens do que o teto de páginas", { label, collected: items.length });
  } catch (err) {
    // API fora do ar durante o build/revalidação não pode derrubar o sitemap inteiro.
    logger.error("Falha ao coletar itens pro sitemap", err, { label, collected: items.length });
  }
  return items;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [locations, photos] = await Promise.all([
    collectAll("locations", (cursor) => searchLocations({ cursor, limit: PAGE_SIZE })),
    collectAll("photos", (cursor) => getPhotos("recent", cursor, PAGE_SIZE)),
  ]);

  return [
    { url: SITE_URL, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/locations`, changeFrequency: "daily", priority: 0.8 },
    { url: `${SITE_URL}/ranking`, changeFrequency: "daily", priority: 0.8 },
    { url: `${SITE_URL}/photos`, changeFrequency: "daily", priority: 0.7 },
    { url: `${SITE_URL}/termos`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${SITE_URL}/privacidade`, changeFrequency: "yearly", priority: 0.2 },
    ...locations.map((location) => ({
      url: `${SITE_URL}/locations/${location.id}`,
      lastModified: location.createdAt,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...photos.map((photo) => ({
      url: `${SITE_URL}/photos/${photo.id}`,
      lastModified: photo.createdAt,
      changeFrequency: "monthly" as const,
      priority: 0.5,
    })),
  ];
}
