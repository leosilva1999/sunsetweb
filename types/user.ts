export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  bio: string | null;
  createdAt: string;
}

export interface AvatarUploadUrl {
  uploadUrl: string;
  avatarUrl: string;
}
