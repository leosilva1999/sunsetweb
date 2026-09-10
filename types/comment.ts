export interface Comment {
  id: string;
  userId: string;
  userName: string;
  userAvatarUrl: string | null;
  content: string;
  createdAt: string;
  parentCommentId: string | null;
  repliesCount: number;
}
