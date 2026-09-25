"use client";

import { useState, type FormEvent } from "react";
import Button from "@/components/ui/Button";
import { useAuth } from "@/lib/hooks/useAuth";
import { createReport } from "@/lib/api/moderation";
import { ApiError } from "@/lib/api/client";
import type { ReportTargetType, ReportReason } from "@/types/report";

interface ReportDialogProps {
  targetType: ReportTargetType;
  targetId: string;
  triggerClassName?: string;
  triggerLabel?: string;
}

const REASONS: { value: ReportReason; label: string }[] = [
  { value: "Spam", label: "Spam" },
  { value: "Inappropriate", label: "Conteúdo impróprio" },
  { value: "Harassment", label: "Assédio" },
  { value: "Other", label: "Outro" },
];

const DETAILS_MAX_LENGTH = 500;

export default function ReportDialog({ targetType, targetId, triggerClassName, triggerLabel = "Denunciar" }: ReportDialogProps) {
  const { getAccessToken } = useAuth();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<ReportReason>("Spam");
  const [details, setDetails] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const handleOpen = () => {
    setOpen(true);
    setDone(false);
    setError(null);
    setReason("Spam");
    setDetails("");
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      const token = await getAccessToken();
      if (!token) {
        setError("Sua sessão expirou. Entre novamente.");
        return;
      }
      await createReport(targetType, targetId, reason, details.trim() || null, token);
      setDone(true);
    } catch (err) {
      setError(err instanceof ApiError && err.status === 409 ? "Você já denunciou isso." : "Não foi possível enviar a denúncia agora.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <button type="button" onClick={handleOpen} className={triggerClassName}>
        {triggerLabel}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-dusk-950/70 px-4 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="report-dialog-title"
            onClick={(event) => event.stopPropagation()}
            className="w-full max-w-sm rounded-2xl border border-white/10 bg-dusk-900 p-6 light:border-line light:bg-paper"
          >
            <h2 id="report-dialog-title" className="mb-4 font-display text-lg font-semibold">
              Denunciar {targetType === "Photo" ? "foto" : "comentário"}
            </h2>

            {done ? (
              <>
                <p className="mb-6 text-sm text-cream-dim light:text-ink-dim">
                  Denúncia enviada. Obrigado por ajudar a manter a comunidade segura.
                </p>
                <div className="flex justify-end">
                  <Button type="button" variant="accent" onClick={() => setOpen(false)}>
                    Fechar
                  </Button>
                </div>
              </>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <select
                  value={reason}
                  onChange={(event) => setReason(event.target.value as ReportReason)}
                  className="rounded-full border border-white/15 bg-transparent px-5 py-3 text-sm text-cream focus:border-white/40 focus:outline-none light:border-ink/15 light:text-ink light:focus:border-ink/40"
                >
                  {REASONS.map((r) => (
                    <option key={r.value} value={r.value} className="bg-dusk-900 text-cream light:bg-paper light:text-ink">
                      {r.label}
                    </option>
                  ))}
                </select>
                <textarea
                  value={details}
                  onChange={(event) => setDetails(event.target.value.slice(0, DETAILS_MAX_LENGTH))}
                  placeholder="Detalhes (opcional)"
                  rows={3}
                  className="resize-none rounded-2xl border border-white/15 bg-transparent px-5 py-3 text-sm text-cream placeholder:text-cream-dim focus:border-white/40 focus:outline-none light:border-ink/15 light:text-ink light:placeholder:text-ink-dim light:focus:border-ink/40"
                />
                {error && <p className="text-sm text-sun-deep">{error}</p>}
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="rounded-full border border-white/15 px-5 py-2.5 text-sm font-medium opacity-85 hover:opacity-100 light:border-ink/15"
                  >
                    Cancelar
                  </button>
                  <Button type="submit" variant="accent" disabled={isSubmitting}>
                    {isSubmitting ? "Enviando..." : "Enviar denúncia"}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
