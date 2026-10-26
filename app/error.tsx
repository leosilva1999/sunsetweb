"use client";

import { useEffect } from "react";
import { logger } from "@/lib/utils/logger";

export default function Error({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  useEffect(() => {
    logger.error("Erro não tratado na renderização da página", error, { boundary: "segment" });
  }, [error]);

  return (
    <div className="mx-auto max-w-xl px-[5vw] py-40 text-center">
      <h1 className="mb-4 font-display text-3xl font-semibold">Algo deu errado</h1>
      <p className="mb-8 text-cream-dim light:text-ink-dim">
        Não conseguimos carregar esta página agora. Tente novamente em instantes.
      </p>
      <button
        onClick={() => retry()}
        className="rounded-full bg-cream px-6 py-3 text-sm font-bold text-ink transition-transform hover:-translate-y-0.5 light:bg-ink light:text-paper"
      >
        Tentar de novo
      </button>
      {error.digest && (
        <p className="mt-8 font-mono text-xs text-cream-dim opacity-60 light:text-ink-dim light:opacity-100">
          Código do erro: {error.digest}
        </p>
      )}
    </div>
  );
}
