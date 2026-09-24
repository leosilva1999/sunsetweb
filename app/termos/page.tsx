import type { Metadata } from "next";
import Link from "next/link";
import { getTerms } from "@/lib/api/legalDocuments";
import { formatDate } from "@/lib/utils/formatDate";

export const metadata: Metadata = { title: "Termos de Uso — Sunset" };

// Sem searchParams/cookies, a página seria pré-renderizada estática no build e
// congelaria os termos vigentes naquele momento — revalida periodicamente em vez
// de exigir um redeploy toda vez que um Admin publicar uma nova versão via
// PUT /terms.
export const revalidate = 60;

export default async function TermsOfUsePage() {
  const terms = await getTerms().catch(() => null);

  return (
    <div className="px-[5vw] py-32">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-2 font-display text-3xl font-semibold">Termos de Uso</h1>

        {terms ? (
          <>
            <p className="mb-10 font-mono text-xs text-cream-dim opacity-70 light:text-ink-dim light:opacity-100">
              Versão {terms.version} · Publicado em {formatDate(terms.createdAt)}
            </p>
            <div className="whitespace-pre-wrap text-sm leading-relaxed text-cream-dim light:text-ink-dim">
              {terms.content}
            </div>
          </>
        ) : (
          <p className="text-sm text-cream-dim opacity-70 light:text-ink-dim light:opacity-100">
            Não foi possível carregar os termos de uso agora.
          </p>
        )}

        <p className="mt-10 border-t border-white/8 pt-6 text-sm text-cream-dim light:border-line light:text-ink-dim">
          Veja também a{" "}
          <Link href="/privacidade" className="underline">
            Política de Privacidade
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
