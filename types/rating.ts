export type RatingScore = 1 | 2 | 3 | 4 | 5;

export interface Rating {
  id: string;
  userId: string;
  userName: string;
  userAvatarUrl: string | null;
  score: RatingScore;
  comment: string | null;
  createdAt: string;
}
