"use client";

import { useEffect, useRef } from "react";
import { useCookieConsent } from "@/lib/hooks/useCookieConsent";

const ADSENSE_CLIENT_ID = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;
const DISPLAY_SLOT_ID = process.env.NEXT_PUBLIC_ADSENSE_DISPLAY_SLOT_ID;

// Bloco de display responsivo (formato "auto"), pra usar entre seções de uma página. Mesmas
// regras do InFeedAd: só aparece com consentimento de cookies e variáveis configuradas, e o
// rótulo "Publicidade" nunca deve ser removido.
export default function DisplayAd({ className = "" }: { className?: string }) {
  const { consent } = useCookieConsent();
  const insRef = useRef<HTMLModElement>(null);
  const pushed = useRef(false);

  const enabled = Boolean(ADSENSE_CLIENT_ID && DISPLAY_SLOT_ID);

  useEffect(() => {
    if (!enabled || consent !== "accepted" || pushed.current || !insRef.current) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      pushed.current = true;
    } catch {
      // adsbygoogle.js ainda não carregou (ou foi bloqueado): o <ins> fica vazio, sem anúncio.
    }
  }, [enabled, consent]);

  if (!enabled || consent !== "accepted") return null;

  return (
    <aside aria-label="Publicidade" className={`overflow-hidden ${className}`}>
      <span className="mb-1 block font-mono text-[0.65rem] tracking-wide text-cream-dim uppercase opacity-60 light:text-ink-dim light:opacity-100">
        Publicidade
      </span>
      <ins
        ref={insRef}
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={ADSENSE_CLIENT_ID}
        data-ad-slot={DISPLAY_SLOT_ID}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </aside>
  );
}
