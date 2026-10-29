import type { Metadata } from "next";
import Link from "next/link";

// O Next já responde 404 e adiciona noindex nesta página; o título só evita o padrão em inglês.
export const metadata: Metadata = { title: "Página não encontrada" };

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-[5vw] py-40 text-center">
      <p className="mb-3 font-mono text-sm tracking-[0.14em] text-sun-mid uppercase light:text-sun-deep">404</p>
      <h1 className="mb-4 font-display text-3xl font-semibold">Página não encontrada</h1>
      <p className="mb-8 text-cream-dim light:text-ink-dim">
        O endereço pode ter mudado, ou o local ou a foto foi removido. Que tal procurar outro pôr do sol?
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <Link
          href="/locations"
          className="rounded-full bg-cream px-6 py-3 text-sm font-bold text-ink transition-transform hover:-translate-y-0.5 light:bg-ink light:text-paper"
        >
          Explorar locais
        </Link>
        <Link
          href="/"
          className="rounded-full border border-white/15 px-6 py-3 text-sm font-medium opacity-85 hover:opacity-100 light:border-ink/15"
        >
          Voltar ao início
        </Link>
      </div>
    </div>
  );
}
