"use client";

import { useState } from "react";
import { useAuth } from "@/lib/hooks/useAuth";
import { useComments } from "@/lib/hooks/useComments";
import CommentForm from "@/components/photo/CommentForm";
import CommentList from "@/components/photo/CommentList";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import type { Comment } from "@/types/comment";
import type { CursorPage } from "@/types/pagination";

interface CommentsProps {
  photoId: string;
  initialPage: CursorPage<Comment>;
}

export default function Comments({ photoId, initialPage }: CommentsProps) {
  const { user } = useAuth();
  const {
    comments,
    hasMore,
    isLoadingMore,
    repliesByCommentId,
    loadingReplyIds,
    post,
    postReply,
    remove,
    removeReply,
    loadMore,
    toggleReplies,
    loadMoreReplies,
  } = useComments(photoId, initialPage);
  const [pendingDelete, setPendingDelete] = useState<Comment | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirmDelete = async () => {
    if (!pendingDelete) return;
    setIsDeleting(true);
    if (pendingDelete.parentCommentId) {
      await removeReply(pendingDelete.parentCommentId, pendingDelete.id);
    } else {
      await remove(pendingDelete.id);
    }
    setIsDeleting(false);
    setPendingDelete(null);
  };

  const isCascadingDelete = !!pendingDelete && !pendingDelete.parentCommentId && pendingDelete.repliesCount > 0;

  return (
    <div>
      <CommentForm onSubmit={post} />
      <CommentList
        comments={comments}
        currentUserId={user?.id}
        repliesByCommentId={repliesByCommentId}
        loadingReplyIds={loadingReplyIds}
        onDelete={setPendingDelete}
        onToggleReplies={toggleReplies}
        onLoadMoreReplies={loadMoreReplies}
        onSubmitReply={postReply}
      />
      {hasMore && (
        <button
          onClick={loadMore}
          disabled={isLoadingMore}
          className="mt-4 text-sm font-medium text-sun-mid hover:opacity-80 light:text-sun-deep"
        >
          {isLoadingMore ? "Carregando..." : "Carregar mais"}
        </button>
      )}

      <ConfirmDialog
        open={pendingDelete !== null}
        title="Excluir comentário?"
        description={
          isCascadingDelete
            ? `Essa ação não pode ser desfeita e vai excluir também ${
                pendingDelete!.repliesCount === 1 ? "a resposta" : `as ${pendingDelete!.repliesCount} respostas`
              }.`
            : "Essa ação não pode ser desfeita."
        }
        confirmLabel="Excluir"
        isConfirming={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}
