"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import LocationPicker from "@/components/location/LocationPicker";
import ImageCropField from "@/components/photo/ImageCropField";
import { useAuth } from "@/lib/hooks/useAuth";
import { useUploadModal } from "@/lib/hooks/useUploadModal";
import { createPhoto, createPhotoUploadUrl } from "@/lib/api/photos";
import { uploadBlob } from "@/lib/api/storage";
import type { Location } from "@/types/location";

export default function UploadPhotoModal() {
  const { isOpen, close } = useUploadModal();
  const router = useRouter();
  const { getAccessToken } = useAuth();
  const [caption, setCaption] = useState("");
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [imageBlob, setImageBlob] = useState<Blob | null>(null);
  const [isNewLocationModalOpen, setIsNewLocationModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStage, setSubmitStage] = useState<"image" | "photo" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [wasOpen, setWasOpen] = useState(isOpen);

  // Reajusta o estado durante a renderização (não num efeito) ao abrir o modal —
  // é o padrão recomendado pelo React pra "resetar estado quando algo muda":
  // https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes
  if (isOpen !== wasOpen) {
    setWasOpen(isOpen);
    if (isOpen) {
      setCaption("");
      setSelectedLocation(null);
      setImageBlob(null);
      setIsNewLocationModalOpen(false);
      setError(null);
    }
  }

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      // Não fecha por cima do modal "adicionar novo local" quando ele está aberto
      // — os dois escutam a mesma tecla globalmente, então sem essa checagem um
      // só Esc fecharia os dois de uma vez.
      if (event.key === "Escape" && !isNewLocationModalOpen) close();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, close, isNewLocationModalOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (!selectedLocation) {
      setError("Escolha o local da foto.");
      return;
    }
    if (!imageBlob) {
      setError("Escolha uma foto.");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      const token = await getAccessToken();
      if (!token) {
        setError("Sua sessão expirou. Entre novamente para publicar.");
        return;
      }

      setSubmitStage("image");
      const { uploadUrl, imageUrl } = await createPhotoUploadUrl(imageBlob.type, token);
      await uploadBlob(uploadUrl, imageBlob);

      setSubmitStage("photo");
      const photo = await createPhoto({ locationId: selectedLocation.id, imageUrl, caption: caption || null }, token);

      close();
      router.push(`/photos/${photo.id}`);
    } catch {
      setError("Não foi possível publicar a foto agora. Tente novamente.");
    } finally {
      setIsSubmitting(false);
      setSubmitStage(null);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-dusk-950/70 px-4 backdrop-blur-sm" onClick={close}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="upload-photo-title"
        onClick={(event) => event.stopPropagation()}
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-white/10 bg-dusk-900 p-6 light:border-line light:bg-paper"
      >
        <h2 id="upload-photo-title" className="mb-6 font-display text-lg font-semibold">
          Postar foto
        </h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <ImageCropField onImageReady={setImageBlob} />

          <LocationPicker
            value={selectedLocation}
            onChange={setSelectedLocation}
            isAddingNew={isNewLocationModalOpen}
            onAddingNewChange={setIsNewLocationModalOpen}
          />

          <textarea
            value={caption}
            onChange={(event) => setCaption(event.target.value)}
            placeholder="Escreva uma legenda..."
            rows={3}
            className="resize-none rounded-2xl border border-white/15 bg-transparent px-5 py-3 text-sm text-cream placeholder:text-cream-dim focus:border-white/40 focus:outline-none light:border-ink/15 light:text-ink light:placeholder:text-ink-dim light:focus:border-ink/40"
          />
          {error && <p className="text-sm text-sun-deep">{error}</p>}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={close}
              className="rounded-full border border-white/15 px-5 py-2.5 text-sm font-medium opacity-85 hover:opacity-100 light:border-ink/15"
            >
              Cancelar
            </button>
            <Button type="submit" variant="accent" disabled={isSubmitting}>
              {submitStage === "image" ? "Enviando foto..." : submitStage === "photo" ? "Publicando..." : "Publicar"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
