"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useAuth } from "@/lib/hooks/useAuth";
import { anonymizeUser } from "@/lib/api/moderation";
import { ApiError } from "@/lib/api/client";

interface AnonymizeUserDialogProps {
  open: boolean;
  userId: string;
  userName: string;
  onDone: () => void;
  onCancel: () => void;
}

const REASON_MAX_LENGTH = 500;

// Só Admin. Remoção IRREVERSÍVEL: a API apaga nome, e-mail, senha, avatar e bio. Se o
// usuário puder voltar um dia, o certo é banir (reversível), não isto.
export default function AnonymizeUserDialog({ open, userId, userName, onDone, onCancel }: AnonymizeUserDialogProps) {
  const { getAccessToken } = useAuth();
  const [reason, setReason] = useState("");
  const [hideContent, setHideContent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [wasOpen, setWasOpen] = useState(open);

  // Zera ao abrir (padrão do React pra ajustar estado quando uma prop muda).
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setReason("");
      setHideContent(false);
      setError(null);
    }
  }

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onCancel]);

  if (!open) return null;

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);

    const trimmedReason = reason.trim();
    if (!trimmedReason) {
      setError("Informe o motivo da remoção.");
      return;
    }

    setIsSaving(true);
    try {
      const token = await getAccessToken();
      if (!token) {
        setError("Sua sessão expirou. Entre novamente.");
        return;
      }
      await anonymizeUser(userId, trimmedReason, hideContent, token);
      onDone();
    } catch (err) {
      if (err instanceof ApiError && err.status === 403) {
        setError("Você não pode remover esta conta. Só Admins removem contas, e nunca a de outro Admin nem a própria.");
      } else if (err instanceof ApiError && err.status === 404) {
        setError("Usuário não encontrado.");
      } else if (err instanceof ApiError && err.status === 409) {
        setError("Esta conta já foi removida.");
      } else if (err instanceof ApiError && err.status === 400 && err.fieldErrors) {
        setError(Object.values(err.fieldErrors).flat().join(" "));
      } else {
        setError("Não foi possível remover a conta agora. Tente novamente.");
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-dusk-950/70 px-4 backdrop-blur-sm" onClick={onCancel}>
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="anonymize-user-title"
        onClick={(event) => event.stopPropagation()}
        className="w-full max-w-sm rounded-2xl border border-white/10 bg-dusk-900 p-6 light:border-line light:bg-paper"
      >
        <h2 id="anonymize-user-title" className="mb-2 font-display text-lg font-semibold">
          Remover a conta de {userName}?
        </h2>
        <p className="mb-5 text-sm text-sun-deep">
          Não dá para desfazer. Nome, e-mail, senha, foto e bio são apagados, o usuário perde o acesso e recebe um e-mail com o motivo. Se
          ele puder voltar um dia, prefira banir.
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <textarea
              value={reason}
              onChange={(event) => setReason(event.target.value.slice(0, REASON_MAX_LENGTH))}
              placeholder="Motivo (obrigatório, o usuário vai ver)"
              rows={3}
              className="w-full resize-none rounded-2xl border border-white/15 bg-transparent px-5 py-3 text-sm text-cream placeholder:text-cream-dim focus:border-white/40 focus:outline-none light:border-ink/15 light:text-ink light:placeholder:text-ink-dim light:focus:border-ink/40"
            />
            <span className="mt-1 block text-right font-mono text-xs text-cream-dim opacity-60 light:text-ink-dim light:opacity-100">
              {reason.length}/{REASON_MAX_LENGTH}
            </span>
          </div>

          <label className="flex items-start gap-2 text-sm">
            <input type="checkbox" checked={hideContent} onChange={(event) => setHideContent(event.target.checked)} className="mt-1" />
            <span>
              Esconder também as fotos e os comentários dele
              <span className="block text-xs text-cream-dim opacity-70 light:text-ink-dim light:opacity-100">
                Sem marcar, o conteúdo continua visível como de &ldquo;Usuário excluído&rdquo;.
              </span>
            </span>
          </label>

          {error && <p className="text-sm text-sun-deep">{error}</p>}
          <div className="mt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="rounded-full border border-white/15 px-5 py-2.5 text-sm font-medium opacity-85 hover:opacity-100 light:border-ink/15"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="rounded-full bg-sun-deep px-5 py-2.5 text-sm font-bold text-white transition-transform hover:-translate-y-0.5 disabled:opacity-60 disabled:hover:translate-y-0"
            >
              {isSaving ? "Removendo..." : "Remover conta"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
