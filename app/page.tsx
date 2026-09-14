import SearchBar from "@/components/location/SearchBar";
import RankingList from "@/components/location/RankingList";
import GalleryTabs from "@/components/photo/GalleryTabs";
import UploadCtaButton from "@/components/photo/UploadCtaButton";
import { getLocationRanking } from "@/lib/api/locations";
import { getPhotos } from "@/lib/api/photos";
import type { PhotoGridItem } from "@/components/photo/PhotoGrid";

// Sem searchParams/cookies, a home seria pré-renderizada estática no build e
// congelaria o ranking/fotos recentes daquele momento — revalida periodicamente
// em vez de exigir um redeploy pra refletir dados novos.
export const revalidate = 60;

export default async function HomePage() {
  const [ranking, photosPage] = await Promise.all([
    getLocationRanking("week", 4).catch(() => []),
    getPhotos("recent", undefined, 5).catch(() => ({ items: [], nextCursor: null, hasMore: false })),
  ]);

  const galleryItems: PhotoGridItem[] = photosPage.items.map((photo) => ({
    photo,
    locationName: photo.locationName,
    city: "",
  }));

  return (
    <>
      <header className="relative flex h-screen min-h-[640px] flex-col justify-end overflow-hidden bg-[linear-gradient(180deg,var(--dusk-950)_0%,var(--dusk-900)_22%,var(--dusk-700)_42%,var(--sun-deep)_60%,var(--sun-mid)_72%,var(--sun-core)_82%,#fff2d6_100%)] light:bg-[linear-gradient(180deg,#fef1de_0%,#ffe0bd_22%,#ffb98a_42%,var(--sun-deep)_62%,var(--sun-mid)_76%,var(--sun-core)_88%,#fff2d6_100%)]">
        <div className="absolute inset-x-0 top-0 h-[45%] bg-[radial-gradient(1.5px_1.5px_at_15%_20%,#fff,transparent),radial-gradient(1.5px_1.5px_at_35%_10%,#fff,transparent),radial-gradient(1px_1px_at_55%_25%,#fff,transparent),radial-gradient(1.5px_1.5px_at_75%_15%,#fff,transparent),radial-gradient(1px_1px_at_88%_30%,#fff,transparent)] opacity-60 light:opacity-0" />
        <div className="absolute bottom-[14%] left-1/2 h-[230px] w-[230px] -translate-x-1/2 animate-pulse rounded-full bg-[radial-gradient(circle_at_40%_35%,#fff6d8,var(--sun-core)_45%,var(--sun-mid)_80%)] shadow-[0_0_90px_20px_rgba(255,140,90,0.55)]" />
        <div className="absolute inset-x-0 bottom-0 h-[16%] bg-dusk-950 opacity-100 [clip-path:polygon(0_40%,12%_30%,26%_45%,40%_20%,55%_38%,68%_15%,82%_34%,100%_22%,100%_100%,0_100%)] light:bg-dusk-900 light:opacity-90" />

        <div className="relative z-[5] max-w-[900px] px-[5vw] pb-16">
          <span className="mb-4.5 block font-mono text-xs tracking-[0.14em] text-cream/75 uppercase light:text-dusk-950/75">
            18.402 pôr do sol catalogados
          </span>
          <h1 className="mb-5.5 font-display text-[clamp(2.6rem,6.5vw,5.2rem)] leading-[0.98] tracking-[-0.01em] text-dusk-950">
            Encontre o
            <br />
            <em className="text-white not-italic font-medium italic">melhor</em>{" "}
            lugar
            <br />
            pra ver o sol se pôr
          </h1>
          <p className="mb-8.5 max-w-[480px] text-[1.08rem] leading-relaxed text-dusk-950/82">
            Descubra os pontos de pôr do sol mais bem avaliados perto de você, veja fotos de quem já foi e
            compartilhe as suas.
          </p>
          <SearchBar />
        </div>
      </header>

      <section id="ranking" className="bg-dusk-900 px-[5vw] py-24 light:bg-paper-dim">
        <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
          <div>
            <span className="mb-2.5 block font-mono text-xs tracking-[0.14em] text-sun-mid uppercase light:text-sun-deep">
              Ranking da semana
            </span>
            <h2 className="font-display text-[clamp(1.9rem,3.4vw,2.8rem)] font-semibold tracking-[-0.01em]">
              Os locais mais bem avaliados
            </h2>
          </div>
          <p className="max-w-[340px] text-sm text-cream-dim opacity-70 light:text-ink-dim light:opacity-100">
            Calculado com base nas curtidas e nas notas dadas pela comunidade nos últimos 7 dias.
          </p>
        </div>
        {ranking.length === 0 ? (
          <p className="text-sm text-cream-dim opacity-70 light:text-ink-dim light:opacity-100">
            Nenhum local avaliado nos últimos 7 dias ainda.
          </p>
        ) : (
          <RankingList locations={ranking} />
        )}
      </section>

      <section id="gallery" className="bg-dusk-950 px-[5vw] py-24 light:bg-paper">
        <div className="mb-9 flex flex-wrap items-end justify-between gap-6">
          <div>
            <span className="mb-2.5 block font-mono text-xs tracking-[0.14em] text-sun-mid uppercase light:text-sun-deep">
              Comunidade
            </span>
            <h2 className="font-display text-[clamp(1.9rem,3.4vw,2.8rem)] font-semibold tracking-[-0.01em]">
              Fotos recentes
            </h2>
          </div>
        </div>
        <GalleryTabs initialItems={galleryItems} />
      </section>

      <section
        id="upload"
        className="relative mx-[5vw] mb-24 flex flex-wrap items-center justify-between gap-10 overflow-hidden rounded-[28px] bg-[linear-gradient(120deg,var(--dusk-800),var(--dusk-700))] px-[6vw] py-16 light:bg-[linear-gradient(120deg,#ffe9d2,#ffd3c2)]"
      >
        <div className="relative z-[2] max-w-[480px]">
          <span className="mb-2.5 block font-mono text-xs tracking-[0.14em] text-sun-core uppercase light:text-sun-deep">
            Participe
          </span>
          <h2 className="mb-3.5 font-display text-[clamp(1.9rem,3.4vw,2.8rem)] font-semibold tracking-[-0.01em]">
            Tirou uma foto boa hoje?
          </h2>
          <p className="leading-relaxed text-cream-dim opacity-80 light:text-ink-dim light:opacity-100">
            Poste sua foto, marque o local no mapa e deixe a comunidade avaliar. As fotos mais curtidas sobem no
            ranking do local.
          </p>
        </div>
        <UploadCtaButton className="relative z-[2] inline-flex items-center gap-2.5 whitespace-nowrap rounded-full bg-sun-core px-8.5 py-4 text-sm font-bold text-ink transition-transform hover:-translate-y-0.5 light:bg-ink light:text-paper" />
      </section>
    </>
  );
}
