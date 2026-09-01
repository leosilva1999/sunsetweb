import { apiFetch } from "@/lib/api/client";
import type { Photo } from "@/types/photo";
import type { Comment } from "@/types/comment";
import type { CursorPage } from "@/types/pagination";

export function getPhotos(sort: "recent" | "top" = "recent", cursor?: string) {
  const query = new URLSearchParams({ sort, ...(cursor ? { cursor } : {}) });
  return apiFetch<CursorPage<Photo>>(`/photos?${query}`);
}

export function getPhoto(id: string) {
  return apiFetch<Photo>(`/photos/${id}`);
}

export function createPhoto(
  data: Pick<Photo, "location_id" | "image_url" | "caption">,
  token: string,
) {
  return apiFetch<Photo>("/photos", {
    method: "POST",
    body: JSON.stringify(data),
    token,
  });
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

export function getPhotoComments(id: string, cursor?: string) {
  const query = cursor ? `?cursor=${cursor}` : "";
  return apiFetch<CursorPage<Comment>>(`/photos/${id}/comments${query}`);
}

export function createComment(id: string, content: string, token: string) {
  return apiFetch<Comment>(`/photos/${id}/comments`, {
    method: "POST",
    body: JSON.stringify({ content }),
    token,
  });
}

export function deleteComment(id: string, token: string) {
  return apiFetch<void>(`/comments/${id}`, { method: "DELETE", token });
}
