"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/hooks/useAuth";
import { getModerationActions } from "@/lib/api/moderation";
import { getComment } from "@/lib/api/photos";
import { formatDate } from "@/lib/utils/formatDate";
import type { ModerationAction, ModerationActionType } from "@/types/report";
import type { Comment } from "@/types/comment";

const ACTION_LABELS: Record<ModerationActionType, string> = {
  PhotoDeleted: "Foto excluída",
  CommentDeleted: "Comentário excluído",
  ReportResolved: "Denúncia resolvida",
  ReportDismissed: "Denúncia descartada",
  LegalDocumentUpdated: "Documento legal atualizado",
  UserRoleChanged: "Papel de usuário alterado",
};

export default function ModerationHistory() {
  const { getAccessToken } = useAuth();
  const [actions, setActions] = useState<ModerationAction[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const token = await getAccessToken();
        if (!token) {
          if (!cancelled) setError("Sua sessão expirou. Entre novamente.");
          return;
        }
        const page = await getModerationActions(token);
        if (!cancelled) {
          setActions(page.items);
          setCursor(page.nextCursor);
          setHasMore(page.hasMore);
        }
      } catch {
        if (!cancelled) setError("Não foi possível carregar o histórico agora.");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [getAccessToken]);

  const loadMore = async () => {
    if (!cursor || isLoadingMore) return;
    setIsLoadingMore(true);
    try {
      const token = await getAccessToken();
      if (!token) return;
      const page = await getModerationActions(token, cursor);
      setActions((prev) => [...prev, ...page.items]);
      setCursor(page.nextCursor);
      setHasMore(page.hasMore);
    } finally {
      setIsLoadingMore(false);
    }
  };

  if (isLoading) {
    return <p className="text-sm text-cream-dim opacity-70 light:text-ink-dim light:opacity-100">Carregando...</p>;
  }

  return (
    <div>
      {error && <p className="mb-4 text-sm text-sun-deep">{error}</p>}

      {actions.length === 0 ? (
        <p className="text-sm text-cream-dim opacity-70 light:text-ink-dim light:opacity-100">Nenhuma ação registrada ainda.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {actions.map((action) => (
            <li key={action.id} className="rounded-2xl border border-white/10 p-4 text-sm light:border-line">
              <div className="mb-1 flex flex-wrap items-center gap-2">
                <span className="font-medium">{ACTION_LABELS[action.actionType]}</span>
                <span className="font-mono text-xs text-cream-dim opacity-70 light:text-ink-dim light:opacity-100">
                  por {action.moderatorName} em {formatDate(action.createdAt)}
                </span>
              </div>
              {action.notes && <p className="text-cream-dim light:text-ink-dim">{action.notes}</p>}
              <ActionTargetLink targetDescription={action.targetDescription} />
            </li>
          ))}
        </ul>
      )}

      {hasMore && (
        <button
          onClick={loadMore}
          disabled={isLoadingMore}
          className="mt-6 text-sm font-medium text-sun-mid hover:opacity-80 light:text-sun-deep"
        >
          {isLoadingMore ? "Carregando..." : "Carregar mais"}
        </button>
      )}
    </div>
  );
}

// TargetDescription é um texto livre no formato "Tipo:id" (ou "Tipo:vN" pros documentos
// legais) - não é um contrato tipado, é só o que cada ação grava pra si mesma no backend.
// Isso resolve pra um link quando dá, e cai pro texto cru quando não reconhece o prefixo.
function ActionTargetLink({ targetDescription }: { targetDescription: string }) {
  const [prefix, rest] = targetDescription.split(":", 2);
  const [comment, setComment] = useState<Comment | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (prefix !== "Comment" || !rest) return;
    let cancelled = false;
    getComment(rest)
      .then((result) => {
        if (!cancelled) setComment(result);
      })
      .catch(() => {
        if (!cancelled) setNotFound(true);
      });
    return () => {
      cancelled = true;
    };
  }, [prefix, rest]);

  const linkClassName = "font-mono text-xs underline";

  if (prefix === "Photo" && rest) {
    return (
      <Link href={`/photos/${rest}`} target="_blank" className={linkClassName}>
        Ver foto
      </Link>
    );
  }

  if (prefix === "Comment" && rest) {
    if (notFound) {
      return <span className="font-mono text-xs opacity-60 italic">Comentário não encontrado</span>;
    }
    if (!comment) {
      return <span className="font-mono text-xs opacity-60">Carregando...</span>;
    }
    return (
      <Link href={`/photos/${comment.photoId}`} target="_blank" className={linkClassName}>
        Ver conversa
      </Link>
    );
  }

  if (prefix === "User" && rest) {
    return (
      <Link href={`/profile/${rest}`} target="_blank" className={linkClassName}>
        Ver perfil
      </Link>
    );
  }

  if (prefix === "TermsOfService" && rest) {
    return (
      <Link href="/termos" target="_blank" className={linkClassName}>
        Ver termos ({rest})
      </Link>
    );
  }

  if (prefix === "PrivacyPolicy" && rest) {
    return (
      <Link href="/privacidade" target="_blank" className={linkClassName}>
        Ver política ({rest})
      </Link>
    );
  }

  return <span className="font-mono text-xs opacity-60">{targetDescription}</span>;
}
