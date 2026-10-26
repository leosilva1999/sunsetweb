"use client";

import { useEffect } from "react";
import { logger } from "@/lib/utils/logger";

// Substitui o layout raiz quando ele mesmo quebra — por isso traz <html>/<body> e
// estilos inline: nem o globals.css nem o Tailwind estão disponíveis aqui.
export default function GlobalError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  useEffect(() => {
    logger.error("Erro não tratado no layout raiz", error, { boundary: "global" });
  }, [error]);

  return (
    <html lang="pt-BR">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#1e1038",
          color: "#fff6ec",
          fontFamily: "system-ui, sans-serif",
          textAlign: "center",
          padding: "0 5vw",
        }}
      >
        <div>
          <h1 style={{ fontSize: "1.9rem", marginBottom: "1rem" }}>Algo deu errado</h1>
          <p style={{ opacity: 0.8, marginBottom: "2rem" }}>
            Não conseguimos carregar o Sunsetsss agora. Tente novamente em instantes.
          </p>
          <button
            onClick={() => retry()}
            style={{
              border: "none",
              borderRadius: 999,
              background: "#fff6ec",
              color: "#1e1038",
              fontWeight: 700,
              fontSize: "0.9rem",
              padding: "0.8rem 1.6rem",
              cursor: "pointer",
            }}
          >
            Tentar de novo
          </button>
          {error.digest && (
            <p style={{ marginTop: "2rem", fontSize: "0.75rem", opacity: 0.6, fontFamily: "monospace" }}>
              Código do erro: {error.digest}
            </p>
          )}
        </div>
      </body>
    </html>
  );
}
