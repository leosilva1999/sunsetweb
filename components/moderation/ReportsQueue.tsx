"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Tabs from "@/components/ui/Tabs";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { useAuth } from "@/lib/hooks/useAuth";
import { getReports, resolveReport } from "@/lib/api/moderation";
import { getPhoto, getComment, deletePhoto, deleteComment } from "@/lib/api/photos";
import { formatDate } from "@/lib/utils/formatDate";
import type { Report, ReportStatus, ReportReason } from "@/types/report";
import type { Photo } from "@/types/photo";
import type { Comment } from "@/types/comment";

const STATUS_LABELS: Record<ReportStatus, string> = {
  Pending: "Pendentes",
  Resolved: "Resolvidas",
  Dismissed: "Descartadas",
};
const STATUS_TABS = Object.values(STATUS_LABELS);
const TAB_STATUS: Record<string, ReportStatus> = { Pendentes: "Pending", Resolvidas: "Resolved", Descartadas: "Dismissed" };

const REASON_LABELS: Record<ReportReason, string> = {
  Spam: "Spam",
  Inappropriate: "Conteúdo impróprio",
  Harassment: "Assédio",
  Other: "Outro",
};

export default function ReportsQueue() {
  const { getAccessToken } = useAuth();
  const [status, setStatus] = useState<ReportStatus>("Pending");
  const [reports, setReports] = useState<Report[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<{ report: Report; kind: "resolve" | "dismiss" | "delete" } | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);

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
        const page = await getReports(status, token);
        if (!cancelled) {
          setReports(page.items);
          setCursor(page.nextCursor);
          setHasMore(page.hasMore);
        }
      } catch {
        if (!cancelled) setError("Não foi possível carregar as denúncias agora.");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [status, getAccessToken]);

  const loadMore = async () => {
    if (!cursor || isLoadingMore) return;
    setIsLoadingMore(true);
    try {
      const token = await getAccessToken();
      if (!token) return;
      const page = await getReports(status, token, cursor);
      setReports((prev) => [...prev, ...page.items]);
      setCursor(page.nextCursor);
      setHasMore(page.hasMore);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const removeFromList = (reportId: string) => setReports((prev) => prev.filter((r) => r.id !== reportId));

  const handleConfirm = async () => {
    if (!pendingAction) return;
    const { report, kind } = pendingAction;
    setIsConfirming(true);
    try {
      const token = await getAccessToken();
      if (!token) return;

      if (kind === "delete") {
        if (report.targetType === "Photo") {
          await deletePhoto(report.targetId, token);
        } else {
          await deleteComment(report.targetId, token);
        }
        await resolveReport(report.id, "Resolved", token).catch(() => {});
      } else {
        await resolveReport(report.id, kind === "resolve" ? "Resolved" : "Dismissed", token);
      }
      removeFromList(report.id);
    } catch {
      setError("Não foi possível concluir a ação agora.");
    } finally {
      setIsConfirming(false);
      setPendingAction(null);
    }
  };

  const dialogCopy = {
    resolve: { title: "Marcar como resolvida?", description: "A denúncia sai da fila de pendentes.", confirmLabel: "Resolver" },
    dismiss: { title: "Descartar denúncia?", description: "A denúncia sai da fila de pendentes sem nenhuma ação sobre o conteúdo.", confirmLabel: "Descartar" },
    delete: {
      title: "Excluir o conteúdo denunciado?",
      description: "Essa ação não pode ser desfeita. A denúncia também será marcada como resolvida.",
      confirmLabel: "Excluir conteúdo",
    },
  } as const;

  return (
    <div>
      <Tabs
        options={STATUS_TABS}
        active={STATUS_LABELS[status]}
        onChange={(tab) => setStatus(TAB_STATUS[tab])}
      />

      {error && <p className="mb-4 text-sm text-sun-deep">{error}</p>}

      {isLoading ? (
        <p className="text-sm text-cream-dim opacity-70 light:text-ink-dim light:opacity-100">Carregando...</p>
      ) : reports.length === 0 ? (
        <p className="text-sm text-cream-dim opacity-70 light:text-ink-dim light:opacity-100">Nenhuma denúncia por aqui.</p>
      ) : (
        <ul className="flex flex-col gap-4">
          {reports.map((report) => (
            <li key={report.id} className="rounded-2xl border border-white/10 p-4 light:border-line">
              <div className="mb-2 flex flex-wrap items-center gap-2 text-xs">
                <span className="rounded-full bg-cream/15 px-2.5 py-1 font-mono uppercase light:bg-ink/10">
                  {report.targetType === "Photo" ? "Foto" : "Comentário"}
                </span>
                <span className="font-mono text-cream-dim opacity-70 light:text-ink-dim light:opacity-100">
                  {REASON_LABELS[report.reason]}
                </span>
                <span className="font-mono text-cream-dim opacity-70 light:text-ink-dim light:opacity-100">
                  · denunciado por {report.reporterName} em {formatDate(report.createdAt)}
                </span>
              </div>

              {report.details && (
                <p className="mb-2 text-sm text-cream-dim light:text-ink-dim">&ldquo;{report.details}&rdquo;</p>
              )}

              <ReportTargetPreview targetType={report.targetType} targetId={report.targetId} />

              {status === "Pending" && (
                <div className="mt-3 flex flex-wrap gap-3">
                  <button
                    onClick={() => setPendingAction({ report, kind: "resolve" })}
                    className="rounded-full border border-white/15 px-4 py-2 text-xs font-medium opacity-85 hover:opacity-100 light:border-ink/15"
                  >
                    Resolver
                  </button>
                  <button
                    onClick={() => setPendingAction({ report, kind: "dismiss" })}
                    className="rounded-full border border-white/15 px-4 py-2 text-xs font-medium opacity-85 hover:opacity-100 light:border-ink/15"
                  >
                    Descartar
                  </button>
                  <button
                    onClick={() => setPendingAction({ report, kind: "delete" })}
                    className="rounded-full border border-sun-deep/40 px-4 py-2 text-xs font-medium text-sun-deep hover:bg-sun-deep/10"
                  >
                    Excluir conteúdo
                  </button>
                </div>
              )}
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

      <ConfirmDialog
        open={pendingAction !== null}
        title={pendingAction ? dialogCopy[pendingAction.kind].title : ""}
        description={pendingAction ? dialogCopy[pendingAction.kind].description : ""}
        confirmLabel={pendingAction ? dialogCopy[pendingAction.kind].confirmLabel : ""}
        isConfirming={isConfirming}
        onConfirm={handleConfirm}
        onCancel={() => setPendingAction(null)}
      />
    </div>
  );
}

function ReportTargetPreview({ targetType, targetId }: { targetType: "Photo" | "Comment"; targetId: string }) {
  const [photo, setPhoto] = useState<Photo | null>(null);
  const [comment, setComment] = useState<Comment | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      try {
        if (targetType === "Photo") {
          const result = await getPhoto(targetId);
          if (!cancelled) setPhoto(result);
        } else {
          const result = await getComment(targetId);
          if (!cancelled) setComment(result);
        }
      } catch {
        if (!cancelled) setNotFound(true);
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [targetType, targetId]);

  if (notFound) {
    return <p className="text-xs text-cream-dim opacity-60 italic light:text-ink-dim light:opacity-100">Conteúdo não encontrado (já excluído?).</p>;
  }

  if (targetType === "Photo") {
    if (!photo) return null;
    return (
      <Link href={`/photos/${photo.id}`} target="_blank" className="text-sm underline">
        {photo.caption || "Ver foto"} — {photo.locationName}
      </Link>
    );
  }

  if (!comment) return null;
  return (
    <div className="text-sm">
      <p className="text-cream-dim light:text-ink-dim">&ldquo;{comment.content}&rdquo;</p>
      <Link href={`/photos/${comment.photoId}`} target="_blank" className="text-xs underline">
        Ver conversa
      </Link>
    </div>
  );
}
