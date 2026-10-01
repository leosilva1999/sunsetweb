"use client";

import Script from "next/script";
import { useCookieConsent } from "@/lib/hooks/useCookieConsent";

const ADSENSE_CLIENT_ID = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;

// Só carrega o script do AdSense (que seta cookies de terceiros) depois que o usuário
// aceita o banner de cookies, e só quando houver um Publisher ID configurado - fica
// no-op em dev até termos uma conta aprovada (ver useAdsEnabled/InFeedAd).
export default function AdSenseScript() {
  const { consent } = useCookieConsent();

  if (!ADSENSE_CLIENT_ID || consent !== "accepted") return null;

  return (
    <Script
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT_ID}`}
      crossOrigin="anonymous"
      strategy="afterInteractive"
    />
  );
}
