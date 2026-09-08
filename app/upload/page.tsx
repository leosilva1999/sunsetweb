"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import LocationMap from "@/components/location/LocationMap";
import { useAuth } from "@/lib/hooks/useAuth";
import { useRequireAuth } from "@/lib/hooks/useRequireAuth";
import { createPhoto } from "@/lib/api/photos";

export default function UploadPage() {
  const router = useRouter();
  const isAuthenticated = useRequireAuth();
  const { getAccessToken } = useAuth();
  const [caption, setCaption] = useState("");
  const [locationId, setLocationId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    setIsSubmitting(true);
    setError(null);
    try {
      const token = await getAccessToken();
      if (!token) {
        setError("Sua sessão expirou. Entre novamente para publicar.");
        return;
      }
      // O fluxo real pede uma URL pré-assinada à API e sobe o arquivo direto pro
      // storage antes deste POST — endpoint da URL pré-assinada ainda não definido
      // na Sunset.API, então o upload do binário fica pendente aqui.
      const photo = await createPhoto({ locationId, imageUrl: "", caption: caption || null }, token);
      router.push(`/photos/${photo.id}`);
    } catch {
      setError("Não foi possível publicar a foto agora. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="px-[5vw] py-32">
      <h1 className="mb-10 font-display text-3xl font-semibold">Postar foto</h1>
      <form onSubmit={handleSubmit} className="flex max-w-lg flex-col gap-6">
        <input type="file" accept="image/*" className="text-sm" />
        <input
          type="text"
          value={locationId}
          onChange={(event) => setLocationId(event.target.value)}
          placeholder="ID do local"
          required
          className="rounded-full border border-white/15 bg-transparent px-5 py-3 text-sm text-cream placeholder:text-cream-dim focus:border-white/40 focus:outline-none light:border-ink/15 light:text-ink light:placeholder:text-ink-dim light:focus:border-ink/40"
        />
        <LocationMap />
        <textarea
          value={caption}
          onChange={(event) => setCaption(event.target.value)}
          placeholder="Escreva uma legenda..."
          rows={3}
          className="rounded-2xl border border-white/15 bg-transparent px-5 py-3 text-sm text-cream placeholder:text-cream-dim focus:border-white/40 focus:outline-none light:border-ink/15 light:text-ink light:placeholder:text-ink-dim light:focus:border-ink/40"
        />
        {error && <p className="text-sm text-sun-deep">{error}</p>}
        <Button type="submit" variant="accent" disabled={isSubmitting} className="self-start">
          {isSubmitting ? "Publicando..." : "Publicar"}
        </Button>
      </form>
    </div>
  );
}
