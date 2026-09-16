import { apiFetch } from "@/lib/api/client";
import type { Photo, PhotoUploadUrl } from "@/types/photo";
import type { Comment } from "@/types/comment";
import type { CursorPage } from "@/types/pagination";

export function getPhotos(sort: "recent" | "top" = "recent", cursor?: string, limit?: number) {
  const query = new URLSearchParams({
    sort,
    ...(cursor ? { cursor } : {}),
    ...(limit ? { limit: String(limit) } : {}),
  });
  return apiFetch<CursorPage<Photo>>(`/photos?${query}`);
}

export function getPhoto(id: string, token?: string | null) {
  return apiFetch<Photo>(`/photos/${id}`, { token });
}

export function createPhoto(
  data: { locationId: string; imageUrl: string; caption: string | null },
  token: string,
) {
  return apiFetch<Photo>("/photos", {
    method: "POST",
    body: JSON.stringify(data),
    token,
  });
}

export function createPhotoUploadUrl(contentType: string, token: string) {
  return apiFetch<PhotoUploadUrl>("/photos/upload-url", {
    method: "POST",
    body: JSON.stringify({ contentType }),
    token,
  });
}

// PUT direto pro storage (LocalStack em dev) via URL pré-assinada — não passa pelo
// apiFetch porque não é uma chamada pra própria API (sem base URL, sem Bearer token,
// content-type é o da imagem, não application/json).
export async function uploadPhotoBlob(uploadUrl: string, blob: Blob): Promise<void> {
  const response = await fetch(uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": blob.type },
    body: blob,
  });
  if (!response.ok) {
    throw new Error("Falha ao enviar a imagem para o storage.");
  }
}

export function deletePhoto(id: string, token: string) {
  return apiFetch<void>(`/photos/${id}`, { method: "DELETE", token });
}

export function likePhoto(id: string, token: string) {
  return apiFetch<void>(`/photos/${id}/likes`, { method: "POST", token });
}

export function unlikePhoto(id: string, token: string) {
  return apiFetch<void>(`/photos/${id}/likes`, { method: "DELETE", token });
}

export function getPhotoComments(id: string, cursor?: string, limit?: number) {
  const query = new URLSearchParams({
    ...(cursor ? { cursor } : {}),
    ...(limit ? { limit: String(limit) } : {}),
  });
  const suffix = query.size > 0 ? `?${query}` : "";
  return apiFetch<CursorPage<Comment>>(`/photos/${id}/comments${suffix}`);
}

export function createComment(id: string, content: string, token: string, parentCommentId: string | null = null) {
  return apiFetch<Comment>(`/photos/${id}/comments`, {
    method: "POST",
    body: JSON.stringify({ content, parentCommentId }),
    token,
  });
}

export function deleteComment(id: string, token: string) {
  return apiFetch<void>(`/comments/${id}`, { method: "DELETE", token });
}

export function getCommentReplies(commentId: string, cursor?: string, limit?: number) {
  const query = new URLSearchParams({
    ...(cursor ? { cursor } : {}),
    ...(limit ? { limit: String(limit) } : {}),
  });
  const suffix = query.size > 0 ? `?${query}` : "";
  return apiFetch<CursorPage<Comment>>(`/comments/${commentId}/replies${suffix}`);
}
