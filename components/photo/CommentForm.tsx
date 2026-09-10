"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/hooks/useAuth";
import { ApiError } from "@/lib/api/client";
import Button from "@/components/ui/Button";

interface CommentFormProps {
  onSubmit: (content: string) => Promise<void>;
  placeholder?: string;
  submitLabel?: string;
  submittingLabel?: string;
  rows?: number;
  className?: string;
  autoFocus?: boolean;
  onCancel?: () => void;
}

export default function CommentForm({
  onSubmit,
  placeholder = "Escreva um comentário...",
  submitLabel = "Comentar",
  submittingLabel = "Enviando...",
  rows = 3,
  className = "mb-6",
  autoFocus = false,
  onCancel,
}: CommentFormProps) {
  const { isAuthenticated } = useAuth();
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isAuthenticated) {
    return (
      <p className="mb-6 text-sm text-cream-dim opacity-70 light:text-ink-dim light:opacity-100">
        <Link href="/login" className="underline">
          Entre
        </Link>{" "}
        para comentar.
      </p>
    );
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const trimmed = content.trim();
    if (!trimmed) return;

    setIsSubmitting(true);
    setError(null);
    try {
      await onSubmit(trimmed);
      setContent("");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Não foi possível enviar seu comentário.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`flex flex-col gap-3 ${className}`}>
      <textarea
        value={content}
        onChange={(event) => setContent(event.target.value)}
        placeholder={placeholder}
        rows={rows}
        maxLength={1000}
        autoFocus={autoFocus}
        required
        className="resize-none rounded-2xl border border-white/15 bg-transparent px-4 py-3 text-sm text-cream placeholder:text-cream-dim focus:border-white/40 focus:outline-none light:border-ink/15 light:text-ink light:placeholder:text-ink-dim light:focus:border-ink/40"
      />
      {error && <p className="text-sm text-sun-deep">{error}</p>}
      <div className="flex justify-end gap-3">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full border border-white/15 px-5 py-2.5 text-sm font-medium opacity-85 hover:opacity-100 light:border-ink/15"
          >
            Cancelar
          </button>
        )}
        <Button type="submit" variant="accent" disabled={isSubmitting}>
          {isSubmitting ? submittingLabel : submitLabel}
        </Button>
      </div>
    </form>
  );
}
