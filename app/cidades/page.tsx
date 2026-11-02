import type { Metadata } from "next";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import CityList from "@/components/city/CityList";
import JsonLd from "@/components/seo/JsonLd";
import { searchCities } from "@/lib/api/cities";
import { buildPageMetadata } from "@/lib/utils/shareMetadata";
import { breadcrumbJsonLd } from "@/lib/utils/structuredData";
import type { CursorPage } from "@/types/pagination";
import type { City } from "@/types/city";

const PAGE_SIZE = 24;

// Página em cache por 60 s (ISR); quando a API avisa uma mudança, POST /api/revalidate
// invalida na hora pelas tags dos fetches.
export const revalidate = 60;

export const metadata: Metadata = buildPageMetadata({
  title: "Cidades com os melhores pores do sol",
  description: "Veja as cidades com locais de pôr do sol cadastrados no Sunsetsss, com fotos, avaliações e os lugares mais bem avaliados de cada uma.",
  path: "/cidades",
});

export default async function CitiesPage() {
  let initialPage: CursorPage<City>;
  let hasError = false;
  try {
    initialPage = await searchCities({ limit: PAGE_SIZE });
  } catch {
    initialPage = { items: [], nextCursor: null, hasMore: false };
    hasError = true;
  }

  return (
    <div className="px-[5vw] py-32">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Início", path: "/" },
          { name: "Cidades", path: "/cidades" },
        ])}
      />
      <Breadcrumbs items={[{ name: "Início", href: "/" }, { name: "Cidades" }]} />
      <h1 className="mb-2 font-display text-3xl font-semibold">Cidades</h1>
      <p className="mb-8 max-w-2xl text-sm text-cream-dim opacity-80 light:text-ink-dim light:opacity-100">
        As cidades com mais locais de pôr do sol cadastrados pela comunidade.
      </p>

      {initialPage.items.length === 0 ? (
        <p className="text-sm text-cream-dim opacity-70 light:text-ink-dim light:opacity-100">
          {hasError ? "Não foi possível carregar as cidades agora." : "Ainda não há cidades com locais cadastrados."}
        </p>
      ) : (
        <CityList initialPage={initialPage} pageSize={PAGE_SIZE} />
      )}
    </div>
  );
}
