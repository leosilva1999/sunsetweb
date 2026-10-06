// Forma pública de um usuário - o que GET /users/{id} devolve (sem auth, id exposto em
// toda foto/comentário/avaliação). Sem email de propósito: ver docs/API.md na Sunset.API.
export interface PublicUser {
  id: string;
  name: string;
  avatarUrl: string | null;
  bio: string | null;
  followersCount: number;
  followingCount: number;
  isFollowedByCurrentUser: boolean;
  createdAt: string;
}

export type UserRole = "User" | "Moderator" | "Admin";

// Forma autenticada - só vem de login/register/refresh e PATCH /users/me, quando é o
// próprio usuário vendo os próprios dados (e de GET /moderation/users, Admin-only).
// ⚠️ O backend (UserResponse) NÃO inclui followersCount/followingCount/
// isFollowedByCurrentUser nessa forma (só PublicUserResponse tem) - não leia esses três
// campos de um User vindo de useAuth(); leia do PublicUser retornado por getUser(id).
export interface User extends PublicUser {
  email: string;
  role: UserRole;
}

export interface AvatarUploadUrl {
  uploadUrl: string;
  avatarUrl: string;
}
