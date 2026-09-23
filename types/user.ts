// Forma pública de um usuário - o que GET /users/{id} devolve (sem auth, id exposto em
// toda foto/comentário/avaliação). Sem email de propósito: ver docs/API.md na Sunset.API.
export interface PublicUser {
  id: string;
  name: string;
  avatarUrl: string | null;
  bio: string | null;
  createdAt: string;
}

// Forma autenticada - só vem de login/register/refresh e PATCH /users/me, quando é o
// próprio usuário vendo os próprios dados.
export interface User extends PublicUser {
  email: string;
}

export interface AvatarUploadUrl {
  uploadUrl: string;
  avatarUrl: string;
}
