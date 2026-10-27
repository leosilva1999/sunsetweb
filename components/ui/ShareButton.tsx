"use client";

import { useShare } from "@/lib/hooks/useShare";

interface ShareButtonProps {
  url: string;
  title: string;
  text?: string;
}

const STATUS_LABEL = {
  copied: "Link copiado!",
  failed: "Não foi possível copiar",
} as const;

export default function ShareButton({ url, title, text }: ShareButtonProps) {
  const { share, status } = useShare({ url, title, text });

  return (
    <button
      type="button"
      onClick={share}
      aria-label="Compartilhar"
      className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2.5 text-sm font-medium opacity-85 transition-opacity hover:opacity-100 light:border-ink/15"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden>
        <circle cx="18" cy="5" r="3" />
        <circle cx="6" cy="12" r="3" />
        <circle cx="18" cy="19" r="3" />
        <path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4" />
      </svg>
      {/* Em tela estreita fica só o ícone; o feedback de status sempre aparece. */}
      <span aria-live="polite" className={status === "idle" ? "hidden sm:inline" : undefined}>
        {status === "idle" ? "Compartilhar" : STATUS_LABEL[status]}
      </span>
    </button>
  );
}
