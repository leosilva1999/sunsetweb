import type { Metadata } from "next";
import Link from "next/link";
import { getPrivacyPolicy } from "@/lib/api/legalDocuments";
import { formatDate } from "@/lib/utils/formatDate";

export const metadata: Metadata = { title: "Política de Privacidade — Sunset" };

// Sem searchParams/cookies, a página seria pré-renderizada estática no build e
// congelaria a política vigente naquele momento — revalida periodicamente em vez
// de exigir um redeploy toda vez que um Admin publicar uma nova versão via
// PUT /privacy.
export const revalidate = 60;

export default async function PrivacyPolicyPage() {
  const privacyPolicy = await getPrivacyPolicy().catch(() => null);

  return (
    <div className="px-[5vw] py-32">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-2 font-display text-3xl font-semibold">Política de Privacidade</h1>

        {privacyPolicy ? (
          <>
            <p className="mb-10 font-mono text-xs text-cream-dim opacity-70 light:text-ink-dim light:opacity-100">
              Versão {privacyPolicy.version} · Publicado em {formatDate(privacyPolicy.createdAt)}
            </p>
            <div className="whitespace-pre-wrap text-sm leading-relaxed text-cream-dim light:text-ink-dim">
              {privacyPolicy.content}
            </div>
          </>
        ) : (
          <p className="text-sm text-cream-dim opacity-70 light:text-ink-dim light:opacity-100">
            Não foi possível carregar a política de privacidade agora.
          </p>
        )}

        <p className="mt-10 border-t border-white/8 pt-6 text-sm text-cream-dim light:border-line light:text-ink-dim">
          Veja também os{" "}
          <Link href="/termos" className="underline">
            Termos de Uso
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
