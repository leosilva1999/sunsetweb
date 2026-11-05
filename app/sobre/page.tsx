import type { Metadata } from "next";
import Link from "next/link";
import { buildPageMetadata } from "@/lib/utils/shareMetadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Sobre o Sunsetsss",
  description:
    "O Sunsetsss é uma comunidade para descobrir, fotografar e avaliar os lugares com os pores do sol mais bonitos.",
  path: "/sobre",
});

const STEPS = [
  {
    title: "Descubra",
    text: "Busque por cidade ou local, veja o ranking da semana ou encontre os pontos mais bem avaliados perto de você.",
  },
  {
    title: "Fotografe",
    text: "Poste a sua foto marcando o local. Se o ponto ainda não existe no mapa, você mesmo pode adicioná-lo.",
  },
  {
    title: "Avalie",
    text: "Curta, comente e dê nota aos locais. As avaliações da comunidade formam os rankings por período, estado e cidade.",
  },
];

export default function AboutPage() {
  return (
    <div className="px-[5vw] py-32">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-4 font-display text-3xl font-semibold">Sobre o Sunsetsss</h1>
        <p className="mb-10 text-lg leading-relaxed text-cream-dim light:text-ink-dim">
          O Sunsetsss é uma comunidade para quem gosta de ver o sol se pôr. Aqui você encontra os lugares com as
          vistas mais bonitas, compartilha as suas fotos e ajuda a descobrir quais pontos valem a ida.
        </p>

        <h2 className="mb-5 font-display text-xl font-semibold">Como funciona</h2>
        <ol className="mb-12 flex flex-col gap-4">
          {STEPS.map((step, index) => (
            <li
              key={step.title}
              className="flex gap-4 rounded-2xl border border-white/10 p-5 light:border-line light:bg-card"
            >
              <span className="font-mono text-xl text-sun-mid light:text-sun-deep">{String(index + 1).padStart(2, "0")}</span>
              <div>
                <h3 className="font-display text-lg font-medium">{step.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-cream-dim light:text-ink-dim">{step.text}</p>
              </div>
            </li>
          ))}
        </ol>

        <h2 className="mb-3 font-display text-xl font-semibold">Feito pela comunidade</h2>
        <p className="mb-10 text-sm leading-relaxed text-cream-dim light:text-ink-dim">
          Os locais, as fotos e as notas vêm de quem usa o site. Por isso contamos com moderação para manter o
          conteúdo respeitoso e confiável, e você pode denunciar qualquer foto, comentário, local ou perfil que não
          pertença à plataforma. Os dados de cidades e localidades vêm do{" "}
          <a
            href="https://www.geonames.org/"
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            GeoNames
          </a>{" "}
          (CC BY 4.0).
        </p>

        <div className="flex flex-wrap gap-3">
          <Link
            href="/locations"
            className="rounded-full bg-sun-core px-6 py-3 text-sm font-bold text-ink transition-opacity hover:opacity-90"
          >
            Explorar locais
          </Link>
          <Link
            href="/contato"
            className="rounded-full border border-white/15 px-6 py-3 text-sm font-medium opacity-85 hover:opacity-100 light:border-ink/15"
          >
            Fale com a gente
          </Link>
        </div>
      </div>
    </div>
  );
}
