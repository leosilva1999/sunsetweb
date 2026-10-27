"use client";

import { useEffect, useRef, useState } from "react";
import { copyToClipboard } from "@/lib/utils/clipboard";
import { logger } from "@/lib/utils/logger";

export type ShareStatus = "idle" | "copied" | "failed";

interface ShareData {
  url: string;
  title: string;
  text?: string;
}

const STATUS_RESET_MS = 2500;

// Usa a folha de compartilhamento nativa quando existe (celular, e Windows/ChromeOS no
// Chrome); senão copia o link. `status` alimenta o feedback "Link copiado!" no botão.
export function useShare({ url, title, text }: ShareData) {
  const [status, setStatus] = useState<ShareStatus>("idle");
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const flash = (next: ShareStatus) => {
    setStatus(next);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setStatus("idle"), STATUS_RESET_MS);
  };

  const share = async () => {
    if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
      try {
        await navigator.share({ url, title, text });
        return;
      } catch (err) {
        // Usuário fechou a folha de compartilhamento: não é erro, e não deve cair no "copiar".
        if (err instanceof DOMException && err.name === "AbortError") return;
        logger.warn("navigator.share falhou, copiando o link", { reason: err instanceof Error ? err.name : "unknown" });
      }
    }

    const copied = await copyToClipboard(url);
    if (!copied) logger.warn("Não foi possível copiar o link de compartilhamento");
    flash(copied ? "copied" : "failed");
  };

  return { share, status };
}
