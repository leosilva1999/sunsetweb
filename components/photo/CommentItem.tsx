"use client";

import { useState } from "react";
import { formatDate } from "@/lib/utils/formatDate";
import CommentForm from "@/components/photo/CommentForm";
import type { Comment } from "@/types/comment";
import type { RepliesState } from "@/lib/hooks/useComments";

interface CommentItemProps {
  comment: Comment;
  currentUserId?: string | null;
  replies?: RepliesState;
  isLoadingReplies: boolean;
  onDelete: (comment: Comment) => void;
  onToggleReplies: (commentId: string) => void;
  onLoadMoreReplies: (commentId: string) => void;
  onSubmitReply: (parentCommentId: string, content: string) => Promise<void>;
}

export default function CommentItem({
  comment,
  currentUserId,
  replies,
  isLoadingReplies,
  onDelete,
  onToggleReplies,
  onLoadMoreReplies,
  onSubmitReply,
}: CommentItemProps) {
  const [isReplying, setIsReplying] = useState(false);

  const handleReplyClick = () => {
    const opening = !isReplying;
    setIsReplying(opening);
    if (opening && !replies) {
      onToggleReplies(comment.id);
    }
  };

  const handleSubmitReply = async (content: string) => {
    await onSubmitReply(comment.id, content);
    setIsReplying(false);
  };

  return (
    <li className="border-b border-white/10 pb-4 text-sm light:border-line">
      <CommentHeader comment={comment} currentUserId={currentUserId} onDelete={onDelete} />
      <p>{comment.content}</p>

      <div className="mt-2 flex items-center gap-4 font-mono text-xs text-cream-dim opacity-70 light:text-ink-dim light:opacity-100">
        {currentUserId && (
          <button onClick={handleReplyClick} className="hover:opacity-100">
            Responder
          </button>
        )}
        {comment.repliesCount > 0 && (
          <button onClick={() => onToggleReplies(comment.id)} className="hover:opacity-100">
            {isLoadingReplies
              ? "Carregando..."
              : replies
                ? "Ocultar respostas"
                : `Ver ${comment.repliesCount === 1 ? "1 resposta" : `${comment.repliesCount} respostas`}`}
          </button>
        )}
      </div>

      {isReplying && (
        <CommentForm
          onSubmit={handleSubmitReply}
          placeholder="Escreva uma resposta..."
          submitLabel="Responder"
          rows={2}
          className="mt-3 ml-6"
          autoFocus
          onCancel={() => setIsReplying(false)}
        />
      )}

      {replies && (
        <ul className="mt-3 ml-6 flex flex-col gap-3 border-l border-white/10 pl-4 light:border-line">
          {replies.items.map((reply) => (
            <li key={reply.id}>
              <CommentHeader comment={reply} currentUserId={currentUserId} onDelete={onDelete} compact />
              <p>{reply.content}</p>
            </li>
          ))}
          {replies.hasMore && (
            <button
              onClick={() => onLoadMoreReplies(comment.id)}
              disabled={replies.isLoadingMore}
              className="self-start font-mono text-xs text-sun-mid hover:opacity-80 light:text-sun-deep"
            >
              {replies.isLoadingMore ? "Carregando..." : "Carregar mais respostas"}
            </button>
          )}
        </ul>
      )}
    </li>
  );
}

interface CommentHeaderProps {
  comment: Comment;
  currentUserId?: string | null;
  onDelete: (comment: Comment) => void;
  compact?: boolean;
}

function CommentHeader({ comment, currentUserId, onDelete, compact }: CommentHeaderProps) {
  const size = compact ? "h-6 w-6" : "h-7 w-7";
  return (
    <div className="mb-1.5 flex items-center gap-2.5">
      {comment.userAvatarUrl ? (
        <img src={comment.userAvatarUrl} alt="" className={`${size} rounded-full object-cover`} />
      ) : (
        <span className={`flex ${size} items-center justify-center rounded-full bg-cream/15 font-mono text-xs light:bg-ink/10`}>
          {comment.userName.charAt(0).toUpperCase()}
        </span>
      )}
      <span className="font-medium">{comment.userName}</span>
      <span className="font-mono text-xs text-cream-dim opacity-60 light:text-ink-dim light:opacity-100">
        {formatDate(comment.createdAt)}
      </span>
      {comment.userId === currentUserId && (
        <button
          onClick={() => onDelete(comment)}
          className="ml-auto text-xs text-cream-dim opacity-60 hover:text-sun-deep hover:opacity-100 light:text-ink-dim light:opacity-100"
        >
          Excluir
        </button>
      )}
    </div>
  );
}
