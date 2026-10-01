"use client";

import { useEffect, useRef } from "react";
import { useCookieConsent } from "@/lib/hooks/useCookieConsent";

const ADSENSE_CLIENT_ID = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;
const IN_FEED_SLOT_ID = process.env.NEXT_PUBLIC_ADSENSE_IN_FEED_SLOT_ID;
// O layout-key de um in-feed ad é gerado pelo próprio AdSense quando você cria a
// unidade na UI (não dá pra inventar um) - fica vazio até existir uma conta aprovada.
const IN_FEED_LAYOUT_KEY = process.env.NEXT_PUBLIC_ADSENSE_IN_FEED_LAYOUT_KEY;

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

// Card do mesmo formato dos PhotoCard ao redor (mesma altura de grid, mesmo
// container arredondado), mas com o rótulo "Publicidade" visível acima do anúncio -
// AdSense proíbe disfarçar anúncio como conteúdo, então isso nunca deve ser removido.
export default function InFeedAd() {
  const { consent } = useCookieConsent();
  const insRef = useRef<HTMLModElement>(null);
  const pushed = useRef(false);

  const enabled = Boolean(ADSENSE_CLIENT_ID && IN_FEED_SLOT_ID && IN_FEED_LAYOUT_KEY);

  useEffect(() => {
    if (!enabled || consent !== "accepted" || pushed.current || !insRef.current) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      pushed.current = true;
    } catch {
      // adsbygoogle.js ainda não carregou (ou foi bloqueado por um ad blocker) - o
      // <ins> fica vazio, o que é um resultado aceitável, só sem anúncio nesse slot.
    }
  }, [enabled, consent]);

  if (!enabled || consent !== "accepted") return null;

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-dusk-900 light:border-line light:bg-card">
      <span className="px-3.5 pt-2.5 font-mono text-[0.65rem] tracking-wide text-cream-dim uppercase opacity-60 light:text-ink-dim light:opacity-100">
        Publicidade
      </span>
      <ins
        ref={insRef}
        className="adsbygoogle flex-1"
        style={{ display: "block" }}
        data-ad-client={ADSENSE_CLIENT_ID}
        data-ad-slot={IN_FEED_SLOT_ID}
        data-ad-format="fluid"
        data-ad-layout-key={IN_FEED_LAYOUT_KEY}
      />
    </div>
  );
}
