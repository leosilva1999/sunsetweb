"use client";

import { useEffect, useState, type FormEvent } from "react";
import Button from "@/components/ui/Button";
import ImageCropField from "@/components/photo/ImageCropField";
import { useAuth } from "@/lib/hooks/useAuth";
import { ApiError } from "@/lib/api/client";
import { createAvatarUploadUrl } from "@/lib/api/auth";
import { uploadBlob } from "@/lib/api/storage";
import type { User } from "@/types/user";

interface EditProfileModalProps {
  open: boolean;
  user: User;
  onSaved: (user: User) => void;
  onCancel: () => void;
}

const BIO_MAX_LENGTH = 160;

export default function EditProfileModal({ open, user, onSaved, onCancel }: EditProfileModalProps) {
  const { updateProfile, getAccessToken } = useAuth();
  const [name, setName] = useState(user.name);
  // undefined = avatar não mexido (mantém o atual) · null = removido · Blob = novo corte aplicado
  const [avatarBlob, setAvatarBlob] = useState<Blob | null | undefined>(undefined);
  const [bio, setBio] = useState(user.bio ?? "");
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [wasOpen, setWasOpen] = useState(open);

  // Reajusta o estado durante a renderização (não num efeito) ao abrir o modal —
  // é o padrão recomendado pelo React pra "resetar estado quando algo muda":
  // https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setName(user.name);
      setAvatarBlob(undefined);
      setBio(user.bio ?? "");
      setError(null);
    }
  }

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onCancel]);

  if (!open) return null;

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setIsSaving(true);
    setError(null);
    try {
      const patch: Partial<{ name: string; avatarUrl: string | null; bio: string | null }> = {
        name: name.trim(),
        bio: bio.trim() || null,
      };

      // avatarBlob só entra no PATCH se o usuário de fato mexeu nele — omitido,
      // o /users/me PATCH é um partial update de verdade e mantém o avatar atual.
      if (avatarBlob !== undefined) {
        if (avatarBlob === null) {
          patch.avatarUrl = null;
        } else {
          const token = await getAccessToken();
          if (!token) {
            setError("Sua sessão expirou. Entre novamente para salvar.");
            return;
          }
          const { uploadUrl, avatarUrl } = await createAvatarUploadUrl(avatarBlob.type, token);
          await uploadBlob(uploadUrl, avatarBlob);
          patch.avatarUrl = avatarUrl;
        }
      }

      const updated = await updateProfile(patch);
      onSaved(updated);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Não foi possível salvar as alterações.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-dusk-950/70 px-4 backdrop-blur-sm" onClick={onCancel}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-profile-title"
        onClick={(event) => event.stopPropagation()}
        className="w-full max-w-sm rounded-2xl border border-white/10 bg-dusk-900 p-6 light:border-line light:bg-paper"
      >
        <h2 id="edit-profile-title" className="mb-6 font-display text-lg font-semibold">
          Editar perfil
        </h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Nome"
            required
            className="rounded-full border border-white/15 bg-transparent px-5 py-3 text-sm text-cream placeholder:text-cream-dim focus:border-white/40 focus:outline-none light:border-ink/15 light:text-ink light:placeholder:text-ink-dim light:focus:border-ink/40"
          />
          <div>
            <span className="mb-2 block text-xs font-medium text-cream-dim opacity-70 light:text-ink-dim light:opacity-100">
              Foto de perfil
            </span>
            <ImageCropField
              onImageReady={setAvatarBlob}
              initialPreviewUrl={user.avatarUrl}
              aspect={1}
              cropShape="round"
            />
          </div>
          <div>
            <textarea
              value={bio}
              onChange={(event) => setBio(event.target.value.slice(0, BIO_MAX_LENGTH))}
              placeholder="Conte um pouco sobre você (opcional)"
              rows={3}
              maxLength={BIO_MAX_LENGTH}
              className="w-full resize-none rounded-2xl border border-white/15 bg-transparent px-5 py-3 text-sm text-cream placeholder:text-cream-dim focus:border-white/40 focus:outline-none light:border-ink/15 light:text-ink light:placeholder:text-ink-dim light:focus:border-ink/40"
            />
            <span className="mt-1 block text-right font-mono text-xs text-cream-dim opacity-60 light:text-ink-dim light:opacity-100">
              {bio.length}/{BIO_MAX_LENGTH}
            </span>
          </div>
          {error && <p className="text-sm text-sun-deep">{error}</p>}
          <div className="mt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="rounded-full border border-white/15 px-5 py-2.5 text-sm font-medium opacity-85 hover:opacity-100 light:border-ink/15"
            >
              Cancelar
            </button>
            <Button type="submit" variant="accent" disabled={isSaving}>
              {isSaving ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
