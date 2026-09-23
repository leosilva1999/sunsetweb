import Image from "next/image";
import { formatDate } from "@/lib/utils/formatDate";
import type { Rating } from "@/types/rating";

const SCORES = [1, 2, 3, 4, 5];

interface RatingListProps {
  ratings: Rating[];
}

export default function RatingList({ ratings }: RatingListProps) {
  if (ratings.length === 0) {
    return <p className="text-sm text-cream-dim opacity-70 light:text-ink-dim light:opacity-100">Nenhuma avaliação ainda.</p>;
  }

  return (
    <ul className="flex flex-col gap-4">
      {ratings.map((rating) => (
        <li key={rating.id} className="border-b border-white/10 pb-4 text-sm light:border-line">
          <div className="mb-1.5 flex flex-wrap items-center gap-2.5">
            {rating.userAvatarUrl ? (
              // unoptimized: avatarUrl é uma URL arbitrária que o próprio usuário escolhe
              // (ver EditProfileModal) - não dá pra colocar todo host possível em
              // remotePatterns, e permitir qualquer host lá seria abrir um proxy de
              // imagens pro servidor buscar URLs arbitrárias de terceiros.
              <Image src={rating.userAvatarUrl} alt="" width={28} height={28} unoptimized className="h-7 w-7 rounded-full object-cover" />
            ) : (
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-cream/15 font-mono text-xs light:bg-ink/10">
                {rating.userName.charAt(0).toUpperCase()}
              </span>
            )}
            <span className="font-medium">{rating.userName}</span>
            <span className="flex items-center gap-0.5">
              {SCORES.map((value) => (
                <svg
                  key={value}
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  className={`h-3 w-3 ${
                    value <= rating.score
                      ? "fill-sun-core stroke-sun-core"
                      : "fill-none stroke-cream-dim opacity-40 light:stroke-ink-dim"
                  }`}
                >
                  <polygon points="12 2 15 9 22 9.5 17 14.5 18.5 22 12 18 5.5 22 7 14.5 2 9.5 9 9" />
                </svg>
              ))}
            </span>
            <span className="ml-auto font-mono text-xs text-cream-dim opacity-60 light:text-ink-dim light:opacity-100">
              {formatDate(rating.createdAt)}
            </span>
          </div>
          {rating.comment && <p>{rating.comment}</p>}
        </li>
      ))}
    </ul>
  );
}
