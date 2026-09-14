"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { useAuth } from "@/lib/hooks/useAuth";
import { deleteRating, getMyRating, rateLocation } from "@/lib/api/locations";
import { ApiError } from "@/lib/api/client";
import type { Rating, RatingScore } from "@/types/rating";

const SCORES: RatingScore[] = [1, 2, 3, 4, 5];

interface RatingWidgetProps {
  locationId: string;
  onChanged: (updated: Rating | null, previous: Rating | null) => void;
}

export default function RatingWidget({ locationId, onChanged }: RatingWidgetProps) {
  const { isAuthenticated, getAccessToken } = useAuth();
  const router = useRouter();
  const [myRating, setMyRating] = useState<Rating | null>(null);
  const [isLoadingMyRating, setIsLoadingMyRating] = useState(true);
  const [score, setScore] = useState<RatingScore>(5);
  const [hoverScore, setHoverScore] = useState<RatingScore | null>(null);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [wasAuthenticated, setWasAuthenticated] = useState(isAuthenticated);

  // Ajusta o estado durante a renderização (não num efeito) quando a autenticação
  // muda — padrão recomendado pelo React pra isso: adjusting-state-when-a-prop-changes.
  if (isAuthenticated !== wasAuthenticated) {
    setWasAuthenticated(isAuthenticated);
    if (!isAuthenticated) {
      setMyRating(null);
      setScore(5);
      setComment("");
      setIsLoadingMyRating(false);
    } else {
      setIsLoadingMyRating(true);
    }
  }

  // A avaliação do usuário atual não pode ser buscada no servidor (o JWT só
  // existe no localStorage do cliente) — resolve aqui assim que sabemos se
  // está autenticado, pra decidir "Avaliar" vs "Atualizar avaliação".
  useEffect(() => {
    if (!isAuthenticated) return;
    let cancelled = false;
    (async () => {
      const token = await getAccessToken();
      if (!token) {
        if (!cancelled) setIsLoadingMyRating(false);
        return;
      }
      const rating = await getMyRating(locationId, token).catch(() => null);
      if (!cancelled) {
        setMyRating(rating);
        setScore(rating?.score ?? 5);
        setComment(rating?.comment ?? "");
        setIsLoadingMyRating(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, locationId, getAccessToken]);

  if (!isAuthenticated) {
    return (
      <div className="rounded-2xl border border-white/10 p-5 light:border-line light:bg-card">
        <h3 className="mb-2 font-display text-lg font-semibold">Avaliar este local</h3>
        <p className="text-sm text-cream-dim opacity-70 light:text-ink-dim light:opacity-100">
          <Link href="/login" className="underline">
            Entre
          </Link>{" "}
          pra avaliar este local.
        </p>
      </div>
    );
  }

  if (isLoadingMyRating) {
    return (
      <div className="rounded-2xl border border-white/10 p-5 light:border-line light:bg-card">
        <h3 className="mb-2 font-display text-lg font-semibold">Avaliar este local</h3>
        <p className="text-sm text-cream-dim opacity-60 light:text-ink-dim light:opacity-100">Carregando...</p>
      </div>
    );
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);
    const previous = myRating;
    try {
      const token = await getAccessToken();
      if (!token) {
        setError("Sua sessão expirou. Entre novamente para avaliar.");
        return;
      }
      const updated = await rateLocation(locationId, { score, comment: comment.trim() || null }, token);
      setMyRating(updated);
      onChanged(updated, previous);
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Não foi possível salvar sua avaliação.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    const previous = myRating;
    try {
      const token = await getAccessToken();
      if (!token) return;
      await deleteRating(locationId, token);
      setMyRating(null);
      setScore(5);
      setComment("");
      onChanged(null, previous);
      router.refresh();
    } catch {
      setError("Não foi possível remover sua avaliação.");
    } finally {
      setIsDeleting(false);
      setConfirmDeleteOpen(false);
    }
  };

  const displayScore = hoverScore ?? score;

  return (
    <div className="rounded-2xl border border-white/10 p-5 light:border-line light:bg-card">
      <h3 className="mb-3 font-display text-lg font-semibold">{myRating ? "Sua avaliação" : "Avaliar este local"}</h3>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex gap-1" onMouseLeave={() => setHoverScore(null)}>
          {SCORES.map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setScore(value)}
              onMouseEnter={() => setHoverScore(value)}
              aria-label={`${value} estrela${value > 1 ? "s" : ""}`}
              className="p-0.5"
            >
              <svg
                viewBox="0 0 24 24"
                strokeWidth={2}
                className={`h-7 w-7 ${
                  value <= displayScore
                    ? "fill-sun-core stroke-sun-core"
                    : "fill-none stroke-cream-dim opacity-50 light:stroke-ink-dim"
                }`}
              >
                <polygon points="12 2 15 9 22 9.5 17 14.5 18.5 22 12 18 5.5 22 7 14.5 2 9.5 9 9" />
              </svg>
            </button>
          ))}
        </div>
        <textarea
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          placeholder="Comentário (opcional)"
          rows={2}
          maxLength={1000}
          className="resize-none rounded-2xl border border-white/15 bg-transparent px-4 py-3 text-sm text-cream placeholder:text-cream-dim focus:border-white/40 focus:outline-none light:border-ink/15 light:text-ink light:placeholder:text-ink-dim light:focus:border-ink/40"
        />
        {error && <p className="text-sm text-sun-deep">{error}</p>}
        <div className="flex items-center justify-between gap-3">
          {myRating ? (
            <button
              type="button"
              onClick={() => setConfirmDeleteOpen(true)}
              className="text-sm text-cream-dim opacity-70 hover:text-sun-deep hover:opacity-100 light:text-ink-dim light:opacity-100"
            >
              Remover avaliação
            </button>
          ) : (
            <span />
          )}
          <Button type="submit" variant="accent" disabled={isSubmitting}>
            {isSubmitting ? "Salvando..." : myRating ? "Atualizar avaliação" : "Enviar avaliação"}
          </Button>
        </div>
      </form>

      <ConfirmDialog
        open={confirmDeleteOpen}
        title="Remover avaliação?"
        description="Essa ação não pode ser desfeita."
        confirmLabel="Remover"
        isConfirming={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmDeleteOpen(false)}
      />
    </div>
  );
}
