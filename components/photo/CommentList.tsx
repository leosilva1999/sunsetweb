import type { Comment } from "@/types/comment";

interface CommentListProps {
  comments: Comment[];
}

export default function CommentList({ comments }: CommentListProps) {
  if (comments.length === 0) {
    return <p className="text-sm text-cream-dim opacity-70 light:text-ink-dim light:opacity-100">Nenhum comentário ainda.</p>;
  }

  return (
    <ul className="flex flex-col gap-4">
      {comments.map((comment) => (
        <li key={comment.id} className="border-b border-white/10 pb-4 text-sm light:border-line">
          {comment.content}
        </li>
      ))}
    </ul>
  );
}
