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
  const { comments, hasMore, isLoadingMore, post, remove, loadMore } = useComments(photoId, initialPage);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirmDelete = async () => {
    if (!pendingDeleteId) return;
    setIsDeleting(true);
    await remove(pendingDeleteId);
    setIsDeleting(false);
    setPendingDeleteId(null);
  };

  return (
    <div>
      <CommentForm onSubmit={post} />
      <CommentList comments={comments} currentUserId={user?.id} onDelete={setPendingDeleteId} />
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
        open={pendingDeleteId !== null}
        title="Excluir comentário?"
        description="Essa ação não pode ser desfeita."
        confirmLabel="Excluir"
        isConfirming={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setPendingDeleteId(null)}
      />
    </div>
  );
}
