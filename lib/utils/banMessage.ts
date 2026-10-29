import { ApiError } from "@/lib/api/client";
import { formatDate } from "@/lib/utils/formatDate";

function firstFieldError(fieldErrors: Record<string, string[]> | null, field: string): string | null {
  if (!fieldErrors) return null;
  const key = Object.keys(fieldErrors).find((k) => k.toLowerCase() === field.toLowerCase());
  return key ? (fieldErrors[key][0] ?? null) : null;
}

// POST /auth/login e /auth/google respondem 403 { errors: { reason, bannedUntil? } } pra
// conta banida (só depois de validar a senha, então 403 aqui nunca é "senha errada").
// Devolve a mensagem pronta pra exibir, ou null se o erro não for de banimento.
export function getBanMessage(err: unknown): string | null {
  if (!(err instanceof ApiError) || err.status !== 403) return null;

  const reason = firstFieldError(err.fieldErrors, "reason");
  const until = firstFieldError(err.fieldErrors, "bannedUntil");

  let message = "Esta conta está suspensa.";
  if (reason) message += ` Motivo: ${reason}`;
  if (until && !Number.isNaN(new Date(until).getTime())) {
    message += ` A suspensão termina em ${formatDate(until)}.`;
  }
  return message;
}
