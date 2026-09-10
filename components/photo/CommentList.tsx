import CommentItem from "@/components/photo/CommentItem";
import type { Comment } from "@/types/comment";
import type { RepliesState } from "@/lib/hooks/useComments";

interface CommentListProps {
  comments: Comment[];
  currentUserId?: string | null;
  repliesByCommentId: Record<string, RepliesState>;
  loadingReplyIds: Set<string>;
  onDelete: (comment: Comment) => void;
  onToggleReplies: (commentId: string) => void;
  onLoadMoreReplies: (commentId: string) => void;
  onSubmitReply: (parentCommentId: string, content: string) => Promise<void>;
}

export default function CommentList({
  comments,
  currentUserId,
  repliesByCommentId,
  loadingReplyIds,
  onDelete,
  onToggleReplies,
  onLoadMoreReplies,
  onSubmitReply,
}: CommentListProps) {
  if (comments.length === 0) {
    return <p className="text-sm text-cream-dim opacity-70 light:text-ink-dim light:opacity-100">Nenhum comentário ainda.</p>;
  }

  return (
    <ul className="flex flex-col gap-4">
      {comments.map((comment) => (
        <CommentItem
          key={comment.id}
          comment={comment}
          currentUserId={currentUserId}
          replies={repliesByCommentId[comment.id]}
          isLoadingReplies={loadingReplyIds.has(comment.id)}
          onDelete={onDelete}
          onToggleReplies={onToggleReplies}
          onLoadMoreReplies={onLoadMoreReplies}
          onSubmitReply={onSubmitReply}
        />
      ))}
    </ul>
  );
}
