export interface Photo {
  id: string;
  userId: string;
  userName: string;
  userAvatarUrl: string | null;
  locationId: string;
  locationName: string;
  imageUrl: string;
  caption: string | null;
  likesCount: number;
  likedByCurrentUser: boolean;
  commentsCount: number;
  createdAt: string;
}

export interface PhotoUploadUrl {
  uploadUrl: string;
  imageUrl: string;
}
