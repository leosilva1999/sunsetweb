"use client";

import { useRouter } from "next/navigation";

// As coordenadas não vão na URL (privacidade) — só o flag. A permissão de
// geolocalização é pedida em /locations, que ativa o modo ao ver `nearby=1`.
export default function NearbyButton() {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => router.push("/locations?nearby=1")}
      className="inline-flex items-center gap-2 rounded-full border border-dusk-950/25 bg-white/30 px-5 py-2.5 text-sm font-bold text-dusk-950 backdrop-blur transition-colors hover:bg-white/50"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4" aria-hidden>
        <path d="M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21z" />
        <circle cx="12" cy="9.5" r="2.5" />
      </svg>
      Locais perto de mim
    </button>
  );
}
