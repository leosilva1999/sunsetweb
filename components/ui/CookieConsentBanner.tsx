"use client";

import Link from "next/link";
import Button from "@/components/ui/Button";
import { useCookieConsent } from "@/lib/hooks/useCookieConsent";

export default function CookieConsentBanner() {
  const { consent, accept, reject } = useCookieConsent();

  if (consent !== null) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-dusk-950 px-[5vw] py-5 light:border-line light:bg-paper">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4">
        <p className="max-w-[560px] text-sm text-cream-dim light:text-ink-dim">
          Usamos cookies para personalizar conteúdo e, futuramente, exibir anúncios. Você pode
          aceitar ou recusar os cookies não essenciais — veja nossa{" "}
          <Link href="/privacidade" className="underline">
            Política de Privacidade
          </Link>
          .
        </p>
        <div className="flex shrink-0 gap-3">
          <Button variant="outline" onClick={reject}>
            Recusar
          </Button>
          <Button variant="accent" onClick={accept}>
            Aceitar
          </Button>
        </div>
      </div>
    </div>
  );
}
