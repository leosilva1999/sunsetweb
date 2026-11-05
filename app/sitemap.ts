import type { MetadataRoute } from "next";
import { getSitemapEntries } from "@/lib/api/cities";
import { SITE_URL } from "@/lib/utils/siteUrl";
import { logger } from "@/lib/utils/logger";
import type { CursorPage } from "@/types/pagination";

// Sem isso o sitemap seria gerado uma vez no build e nunca mais refletiria
// locais/fotos novos.
export const revalidate = 3600;

// GET /sitemap/entries devolve até 1000 itens por página, sem rate limit de busca. O teto de
// páginas é só uma trava contra loop; passando dele o sitemap fica truncado (o aviso no log
// deixa isso visível). Um arquivo de sitemap comporta no máximo 50 mil URLs: se o total chegar
// perto disso, é hora de dividir com generateSitemaps.
const PAGE_SIZE = 1000;
const MAX_PAGES = 25;

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
  const [cities, localities, locations, photos] = await Promise.all([
    collectAll("cities", (cursor) => getSitemapEntries("city", cursor, PAGE_SIZE)),
    collectAll("localities", (cursor) => getSitemapEntries("locality", cursor, PAGE_SIZE)),
    collectAll("locations", (cursor) => getSitemapEntries("location", cursor, PAGE_SIZE)),
    collectAll("photos", (cursor) => getSitemapEntries("photo", cursor, PAGE_SIZE)),
  ]);

  return [
    { url: SITE_URL, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/locations`, changeFrequency: "daily", priority: 0.8 },
    { url: `${SITE_URL}/ranking`, changeFrequency: "daily", priority: 0.8 },
    { url: `${SITE_URL}/cidades`, changeFrequency: "daily", priority: 0.8 },
    { url: `${SITE_URL}/photos`, changeFrequency: "daily", priority: 0.7 },
    { url: `${SITE_URL}/sobre`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/contato`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/termos`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${SITE_URL}/privacidade`, changeFrequency: "yearly", priority: 0.2 },
    // Municípios e localidades dividem o mesmo formato de endereço (/cidades/{slug}); a API só
    // lista os que têm página (município com local; localidade com local que tem foto).
    ...[...cities, ...localities].flatMap((city) =>
      city.slug
        ? [
            {
              url: `${SITE_URL}/cidades/${city.slug}`,
              lastModified: city.lastModified,
              changeFrequency: "weekly" as const,
              priority: 0.8,
            },
          ]
        : [],
    ),
    ...locations.map((location) => ({
      // Slug é a URL canônica; o id só entra se a API não mandou slug.
      url: `${SITE_URL}/locations/${location.slug ?? location.id}`,
      lastModified: location.lastModified,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...photos.map((photo) => ({
      url: `${SITE_URL}/photos/${photo.id}`,
      lastModified: photo.lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.5,
    })),
  ];
}
