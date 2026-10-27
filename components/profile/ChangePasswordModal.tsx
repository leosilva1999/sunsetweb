"use client";

import { useEffect, useState, type FormEvent } from "react";
import Button from "@/components/ui/Button";
import { useAuth } from "@/lib/hooks/useAuth";
import { ApiError } from "@/lib/api/client";

interface ChangePasswordModalProps {
  open: boolean;
  onChanged: () => void;
  onCancel: () => void;
}

const NEW_PASSWORD_MIN_LENGTH = 8;

const inputClass =
  "rounded-full border border-white/15 bg-transparent px-5 py-3 text-sm text-cream placeholder:text-cream-dim focus:border-white/40 focus:outline-none light:border-ink/15 light:text-ink light:placeholder:text-ink-dim light:focus:border-ink/40";

// A API manda as chaves em PascalCase (CurrentPassword/NewPassword); compara sem diferenciar caixa.
function pickFieldError(fieldErrors: Record<string, string[]> | null, field: string): string | null {
  if (!fieldErrors) return null;
  const key = Object.keys(fieldErrors).find((k) => k.toLowerCase() === field.toLowerCase());
  return key ? fieldErrors[key].join(" ") : null;
}

export default function ChangePasswordModal({ open, onChanged, onCancel }: ChangePasswordModalProps) {
  const { changePassword } = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [currentError, setCurrentError] = useState<string | null>(null);
  const [newError, setNewError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [wasOpen, setWasOpen] = useState(open);

  // Zera o formulário ao abrir (padrão do React pra ajustar estado quando uma prop muda).
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setCurrentError(null);
      setNewError(null);
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
    setCurrentError(null);
    setNewError(null);
    setError(null);

    if (newPassword.length < NEW_PASSWORD_MIN_LENGTH) {
      setNewError(`A nova senha precisa ter pelo menos ${NEW_PASSWORD_MIN_LENGTH} caracteres.`);
      return;
    }
    if (newPassword !== confirmPassword) {
      setNewError("As senhas não coincidem.");
      return;
    }
    if (newPassword === currentPassword) {
      setNewError("A nova senha precisa ser diferente da atual.");
      return;
    }

    setIsSaving(true);
    try {
      await changePassword(currentPassword, newPassword);
      onChanged();
    } catch (err) {
      if (err instanceof ApiError) {
        // 400 aqui é validação de campo (NÃO sessão expirada) - mostra inline, sem deslogar.
        const currentFieldError = pickFieldError(err.fieldErrors, "CurrentPassword");
        const newFieldError = pickFieldError(err.fieldErrors, "NewPassword");
        if (currentFieldError || newFieldError) {
          setCurrentError(currentFieldError);
          setNewError(newFieldError);
        } else if (err.status === 429) {
          setError("Muitas tentativas. Aguarde alguns minutos e tente de novo.");
        } else if (err.status === 409) {
          setError("Sua conta não tem senha. Use \"Esqueci minha senha\" na tela de login para criar uma.");
        } else if (err.status === 401) {
          setError("Sua sessão expirou. Entre novamente para alterar a senha.");
        } else {
          setError("Não foi possível alterar a senha agora. Tente novamente.");
        }
      } else {
        setError("Não foi possível alterar a senha agora. Tente novamente.");
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
        aria-labelledby="change-password-title"
        onClick={(event) => event.stopPropagation()}
        className="w-full max-w-sm rounded-2xl border border-white/10 bg-dusk-900 p-6 light:border-line light:bg-paper"
      >
        <h2 id="change-password-title" className="mb-2 font-display text-lg font-semibold">
          Alterar senha
        </h2>
        <p className="mb-6 text-sm text-cream-dim light:text-ink-dim">
          Seus outros aparelhos serão desconectados. Este continua logado.
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <input
              type="password"
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
              placeholder="Senha atual"
              autoComplete="current-password"
              required
              aria-invalid={currentError ? true : undefined}
              className={inputClass}
            />
            {currentError && <p className="px-2 text-xs text-sun-deep">{currentError}</p>}
          </div>
          <div className="flex flex-col gap-1.5">
            <input
              type="password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              placeholder="Nova senha (mínimo 8 caracteres)"
              autoComplete="new-password"
              required
              aria-invalid={newError ? true : undefined}
              className={inputClass}
            />
            {newError && <p className="px-2 text-xs text-sun-deep">{newError}</p>}
          </div>
          <input
            type="password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            placeholder="Confirmar nova senha"
            autoComplete="new-password"
            required
            className={inputClass}
          />
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
              {isSaving ? "Alterando..." : "Alterar senha"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
