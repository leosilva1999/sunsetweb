import type { Comment } from "@/types/comment";
import { formatDate } from "@/lib/utils/formatDate";

interface CommentListProps {
  comments: Comment[];
  currentUserId?: string | null;
  onDelete?: (commentId: string) => void;
}

export default function CommentList({ comments, currentUserId, onDelete }: CommentListProps) {
  if (comments.length === 0) {
    return <p className="text-sm text-cream-dim opacity-70 light:text-ink-dim light:opacity-100">Nenhum comentário ainda.</p>;
  }

  return (
    <ul className="flex flex-col gap-4">
      {comments.map((comment) => (
        <li key={comment.id} className="border-b border-white/10 pb-4 text-sm light:border-line">
          <div className="mb-1.5 flex items-center gap-2.5">
            {comment.userAvatarUrl ? (
              <img src={comment.userAvatarUrl} alt="" className="h-7 w-7 rounded-full object-cover" />
            ) : (
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-cream/15 font-mono text-xs light:bg-ink/10">
                {comment.userName.charAt(0).toUpperCase()}
              </span>
            )}
            <span className="font-medium">{comment.userName}</span>
            <span className="font-mono text-xs text-cream-dim opacity-60 light:text-ink-dim light:opacity-100">
              {formatDate(comment.createdAt)}
            </span>
            {onDelete && comment.userId === currentUserId && (
              <button
                onClick={() => onDelete(comment.id)}
                className="ml-auto text-xs text-cream-dim opacity-60 hover:text-sun-deep hover:opacity-100 light:text-ink-dim light:opacity-100"
              >
                Excluir
              </button>
            )}
          </div>
          <p>{comment.content}</p>
        </li>
      ))}
    </ul>
  );
}
