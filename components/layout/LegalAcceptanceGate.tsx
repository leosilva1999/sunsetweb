"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Button from "@/components/ui/Button";
import { useAuth } from "@/lib/hooks/useAuth";
import { getApiErrorMessage } from "@/lib/utils/apiErrorMessage";

// Pede o aceite dos Termos/Privacidade quando a API diz que há versão publicada que a pessoa
// ainda não aceitou (conta nova via Google, conta anterior ao registro de aceite, texto novo).
// A API não bloqueia nada sozinha: quem pede é o cliente.
export default function LegalAcceptanceGate() {
  const pathname = usePathname();
  const { legalAcceptance, acceptLegalDocuments, logout } = useAuth();
  const [checked, setChecked] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Nos próprios textos a pessoa precisa conseguir ler antes de aceitar.
  const isLegalPage = pathname === "/termos" || pathname === "/privacidade";
  if (!legalAcceptance?.pending || isLegalPage) return null;

  const { terms, privacy } = legalAcceptance;
  const isUpdate = terms.acceptedVersion !== null || privacy.acceptedVersion !== null;

  const handleAccept = async () => {
    // Um documento nunca publicado não tem versão pra aceitar (e não fica pendente).
    if (terms.currentVersion === null || privacy.currentVersion === null) return;
    setIsSubmitting(true);
    setError(null);
    try {
      await acceptLegalDocuments({ termsVersion: terms.currentVersion, privacyVersion: privacy.currentVersion });
    } catch (err) {
      setError(getApiErrorMessage(err, "Não foi possível registrar o aceite agora. Tente novamente."));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-dusk-950/80 px-4 backdrop-blur-sm">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="legal-acceptance-title"
        className="w-full max-w-md rounded-2xl border border-white/10 bg-dusk-900 p-6 light:border-line light:bg-paper"
      >
        <h2 id="legal-acceptance-title" className="mb-2 font-display text-lg font-semibold">
          {isUpdate ? "Atualizamos nossos termos" : "Antes de continuar"}
        </h2>
        <p className="mb-5 text-sm text-cream-dim opacity-80 light:text-ink-dim light:opacity-100">
          {isUpdate
            ? "Os Termos de Uso ou a Política de Privacidade mudaram. Leia e confirme para continuar usando o Sunsetsss."
            : "Para usar o Sunsetsss precisamos do seu aceite aos Termos de Uso e à Política de Privacidade."}
        </p>
        <label className="mb-5 flex items-start gap-2.5 text-sm text-cream-dim light:text-ink-dim">
          <input
            type="checkbox"
            checked={checked}
            onChange={(event) => setChecked(event.target.checked)}
            className="mt-0.5 h-4 w-4 shrink-0 accent-sun-core"
          />
          <span>
            Li e aceito os{" "}
            <Link href="/termos" target="_blank" className="underline">
              Termos de Uso
            </Link>{" "}
            e a{" "}
            <Link href="/privacidade" target="_blank" className="underline">
              Política de Privacidade
            </Link>
            .
          </span>
        </label>
        {error && <p className="mb-4 text-sm text-sun-deep">{error}</p>}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => void logout()}
            className="rounded-full border border-white/15 px-5 py-2.5 text-sm font-medium opacity-85 hover:opacity-100 light:border-ink/15"
          >
            Sair
          </button>
          <Button type="button" variant="accent" disabled={!checked || isSubmitting} onClick={handleAccept}>
            {isSubmitting ? "Registrando..." : "Aceitar e continuar"}
          </Button>
        </div>
      </div>
    </div>
  );
}
