"use client";

import { useEffect, useState, type FormEvent } from "react";
import Button from "@/components/ui/Button";
import { useAuth } from "@/lib/hooks/useAuth";
import { banUser } from "@/lib/api/moderation";
import { ApiError } from "@/lib/api/client";

interface BanUserDialogProps {
  open: boolean;
  userId: string;
  userName: string;
  onBanned: () => void;
  onCancel: () => void;
}

const REASON_MAX_LENGTH = 500;
const MAX_BAN_YEARS = 10;

const fieldClass =
  "rounded-2xl border border-white/15 bg-transparent px-5 py-3 text-sm text-cream placeholder:text-cream-dim focus:border-white/40 focus:outline-none light:border-ink/15 light:text-ink light:placeholder:text-ink-dim light:focus:border-ink/40";

export default function BanUserDialog({ open, userId, userName, onBanned, onCancel }: BanUserDialogProps) {
  const { getAccessToken } = useAuth();
  const [reason, setReason] = useState("");
  const [permanent, setPermanent] = useState(true);
  const [until, setUntil] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [wasOpen, setWasOpen] = useState(open);

  // Zera o formulário ao abrir (padrão do React pra ajustar estado quando uma prop muda).
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setReason("");
      setPermanent(true);
      setUntil("");
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
      setError("Informe o motivo do banimento.");
      return;
    }

    // datetime-local vem no fuso de quem está digitando; a API quer ISO em UTC.
    let untilIso: string | null = null;
    if (!permanent) {
      const date = new Date(until);
      if (!until || Number.isNaN(date.getTime())) {
        setError("Escolha até quando vai o banimento.");
        return;
      }
      const limit = new Date();
      limit.setFullYear(limit.getFullYear() + MAX_BAN_YEARS);
      if (date.getTime() <= Date.now()) {
        setError("A data precisa estar no futuro.");
        return;
      }
      if (date.getTime() > limit.getTime()) {
        setError(`O banimento pode durar no máximo ${MAX_BAN_YEARS} anos.`);
        return;
      }
      untilIso = date.toISOString();
    }

    setIsSaving(true);
    try {
      const token = await getAccessToken();
      if (!token) {
        setError("Sua sessão expirou. Entre novamente.");
        return;
      }
      await banUser(userId, trimmedReason, untilIso, token);
      onBanned();
    } catch (err) {
      if (err instanceof ApiError && err.status === 403) {
        setError("Você não pode banir este usuário. Administradores não podem ser banidos, e moderadores só por administradores.");
      } else if (err instanceof ApiError && err.status === 404) {
        setError("Usuário não encontrado.");
      } else if (err instanceof ApiError && err.status === 400 && err.fieldErrors) {
        setError(Object.values(err.fieldErrors).flat().join(" "));
      } else {
        setError("Não foi possível banir agora. Tente novamente.");
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-dusk-950/70 px-4 backdrop-blur-sm" onClick={onCancel}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="ban-user-title"
        onClick={(event) => event.stopPropagation()}
        className="w-full max-w-sm rounded-2xl border border-white/10 bg-dusk-900 p-6 light:border-line light:bg-paper"
      >
        <h2 id="ban-user-title" className="mb-2 font-display text-lg font-semibold">
          Banir {userName}?
        </h2>
        <p className="mb-5 text-sm text-cream-dim light:text-ink-dim">
          As sessões do usuário são encerradas na hora e ele recebe um e-mail com o motivo. As fotos e comentários continuam visíveis.
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <textarea
              value={reason}
              onChange={(event) => setReason(event.target.value.slice(0, REASON_MAX_LENGTH))}
              placeholder="Motivo (obrigatório, o usuário vai ver)"
              rows={3}
              className={`w-full resize-none ${fieldClass}`}
            />
            <span className="mt-1 block text-right font-mono text-xs text-cream-dim opacity-60 light:text-ink-dim light:opacity-100">
              {reason.length}/{REASON_MAX_LENGTH}
            </span>
          </div>

          <fieldset className="flex flex-col gap-2 text-sm">
            <legend className="mb-1 text-xs font-medium text-cream-dim opacity-70 light:text-ink-dim light:opacity-100">Duração</legend>
            <label className="flex items-center gap-2">
              <input type="radio" name="ban-duration" checked={permanent} onChange={() => setPermanent(true)} />
              Permanente
            </label>
            <label className="flex items-center gap-2">
              <input type="radio" name="ban-duration" checked={!permanent} onChange={() => setPermanent(false)} />
              Até uma data
            </label>
            {!permanent && (
              <input
                type="datetime-local"
                value={until}
                onChange={(event) => setUntil(event.target.value)}
                aria-label="Banido até"
                className={fieldClass}
              />
            )}
          </fieldset>

          {error && <p className="text-sm text-sun-deep">{error}</p>}
          <div className="mt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="rounded-full border border-white/15 px-5 py-2.5 text-sm font-medium opacity-85 hover:opacity-100 light:border-ink/15"
            >
              Cancelar
            </button>
            <Button type="submit" variant="accent" disabled={isSaving}>
              {isSaving ? "Banindo..." : "Banir"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
