export type NotificationType = "NewFollower" | "PhotoLiked" | "PhotoCommented" | "CommentReplied";

// targetDescription é texto livre no formato "Tipo:id" - "User:{id}" pra NewFollower,
// "Photo:{id}" pra PhotoLiked/PhotoCommented, "Comment:{id}" pra CommentReplied (o
// comentário respondido, não a resposta nova). Mesma convenção do ModerationAction.
export interface Notification {
  id: string;
  type: NotificationType;
  actorUserId: string;
  actorName: string;
  actorAvatarUrl: string | null;
  targetDescription: string;
  readAt: string | null;
  createdAt: string;
}
