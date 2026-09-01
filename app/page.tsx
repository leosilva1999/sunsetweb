import Link from "next/link";
import SearchBar from "@/components/ui/SearchBar";
import RankingList from "@/components/location/RankingList";
import GalleryTabs from "@/components/photo/GalleryTabs";
import type { Location } from "@/types/location";
import type { PhotoGridItem } from "@/components/photo/PhotoGrid";

function gradient(colors: string[]) {
  const stops = colors
    .map((color, index) => `<stop offset="${(index / (colors.length - 1)) * 100}%" stop-color="${color}"/>`)
    .join("");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">${stops}</linearGradient></defs><rect width="400" height="300" fill="url(#g)"/></svg>`;
  return `data:image/svg+xml;base64,${btoa(svg)}`;
}

const MOCK_RANKING: Location[] = [
  { id: "1", name: "Chapada dos Veadeiros, GO", city: "São Jorge, GO", latitude: -14.1667, longitude: -47.5, avg_rating: 4.9 },
  { id: "2", name: "Jericoacoara, CE", city: "Ceará", latitude: -2.7975, longitude: -40.5137, avg_rating: 4.8 },
  { id: "3", name: "Pôr do Sol da Barra, Salvador BA", city: "Salvador, BA", latitude: -13.01, longitude: -38.5321, avg_rating: 4.7 },
  { id: "4", name: "Fernando de Noronha, PE", city: "Pernambuco", latitude: -3.8536, longitude: -32.4297, avg_rating: 4.7 },
];

const MOCK_GALLERY: PhotoGridItem[] = [
  {
    photo: { id: "p1", user_id: "u1", location_id: "1", image_url: gradient(["#150a26", "#4a2b63", "#ff5d6c", "#ffcf6b"]), caption: null, likes_count: 428 },
    locationName: "Chapada dos Veadeiros",
    city: "São Jorge, GO",
    commentsCount: 31,
  },
  {
    photo: { id: "p2", user_id: "u2", location_id: "2", image_url: gradient(["#2d1b4e", "#ff8c5a"]), caption: null, likes_count: 217 },
    locationName: "Jericoacoara",
    city: "Ceará",
  },
  {
    photo: { id: "p3", user_id: "u3", location_id: "5", image_url: gradient(["#1e1038", "#e85d8a"]), caption: null, likes_count: 96 },
    locationName: "Ibirapuera",
    city: "São Paulo, SP",
  },
  {
    photo: { id: "p4", user_id: "u4", location_id: "3", image_url: gradient(["#150a26", "#ff5d6c"]), caption: null, likes_count: 154 },
    locationName: "Praia da Barra",
    city: "Salvador, BA",
  },
  {
    photo: { id: "p5", user_id: "u5", location_id: "6", image_url: gradient(["#4a2b63", "#ffcf6b"]), caption: null, likes_count: 88 },
    locationName: "Dunas do Jalapão",
    city: "Tocantins",
  },
];

const GALLERY_TABS = ["Recentes", "Mais curtidas", "Perto de mim"];

export default function HomePage() {
  return (
    <>
      <header className="relative flex h-screen min-h-[640px] flex-col justify-end overflow-hidden bg-[linear-gradient(180deg,var(--dusk-950)_0%,var(--dusk-900)_22%,var(--dusk-700)_42%,var(--sun-deep)_60%,var(--sun-mid)_72%,var(--sun-core)_82%,#fff2d6_100%)] light:bg-[linear-gradient(180deg,#fef1de_0%,#ffe0bd_22%,#ffb98a_42%,var(--sun-deep)_62%,var(--sun-mid)_76%,var(--sun-core)_88%,#fff2d6_100%)]">
        <div className="absolute inset-x-0 top-0 h-[45%] bg-[radial-gradient(1.5px_1.5px_at_15%_20%,#fff,transparent),radial-gradient(1.5px_1.5px_at_35%_10%,#fff,transparent),radial-gradient(1px_1px_at_55%_25%,#fff,transparent),radial-gradient(1.5px_1.5px_at_75%_15%,#fff,transparent),radial-gradient(1px_1px_at_88%_30%,#fff,transparent)] opacity-60 light:opacity-0" />
        <div className="absolute bottom-[14%] left-1/2 h-[230px] w-[230px] -translate-x-1/2 animate-pulse rounded-full bg-[radial-gradient(circle_at_40%_35%,#fff6d8,var(--sun-core)_45%,var(--sun-mid)_80%)] shadow-[0_0_90px_20px_rgba(255,140,90,0.55)]" />
        <div className="absolute inset-x-0 bottom-0 h-[16%] bg-dusk-950 opacity-100 [clip-path:polygon(0_40%,12%_30%,26%_45%,40%_20%,55%_38%,68%_15%,82%_34%,100%_22%,100%_100%,0_100%)] light:bg-dusk-900 light:opacity-90" />

        <div className="relative z-[5] max-w-[900px] px-[5vw] pb-16">
          <span className="mb-4.5 block font-mono text-xs tracking-[0.14em] text-dusk-950/75 uppercase">
            18.402 pôr do sol catalogados
          </span>
          <h1 className="mb-5.5 font-display text-[clamp(2.6rem,6.5vw,5.2rem)] leading-[0.98] tracking-[-0.01em] text-dusk-950">
            Encontre o
            <br />
            <em className="text-white not-italic font-medium italic [-webkit-text-stroke:0.5px_var(--dusk-950)]">
              melhor
            </em>{" "}
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
        <RankingList locations={MOCK_RANKING} />
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
        <GalleryTabs tabs={GALLERY_TABS} items={MOCK_GALLERY} />
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
        <Link
          href="/upload"
          className="relative z-[2] inline-flex items-center gap-2.5 whitespace-nowrap rounded-full bg-sun-core px-8.5 py-4 text-sm font-bold text-ink transition-transform hover:-translate-y-0.5 light:bg-ink light:text-paper"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="text-ink light:text-paper">
            <path d="M12 19V5M5 12l7-7 7 7" />
          </svg>
          Postar foto
        </Link>
      </section>
    </>
  );
}
