"use client";

import { useCallback, useRef, useState, type ChangeEvent } from "react";
import Cropper, { type Area } from "react-easy-crop";
import { getCroppedImageBlob } from "@/lib/utils/imageCrop";

interface ImageCropFieldProps {
  onImageReady: (blob: Blob | null) => void;
}

const ASPECT_RATIO = 4 / 3;
const MAX_DIMENSION = 1600;
const JPEG_QUALITY = 0.85;

export default function ImageCropField({ onImageReady }: ImageCropFieldProps) {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [preview, setPreview] = useState<{ url: string; size: number } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetSelection = () => {
    setImageSrc(null);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Selecione um arquivo de imagem.");
      return;
    }
    setError(null);
    setPreview(null);
    onImageReady(null);
    const reader = new FileReader();
    reader.onload = () => setImageSrc(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleCropComplete = useCallback((_croppedArea: Area, areaPixels: Area) => {
    setCroppedAreaPixels(areaPixels);
  }, []);

  const handleApply = async () => {
    if (!imageSrc || !croppedAreaPixels) return;
    setIsProcessing(true);
    setError(null);
    try {
      const blob = await getCroppedImageBlob(imageSrc, croppedAreaPixels, MAX_DIMENSION, JPEG_QUALITY);
      setPreview({ url: URL.createObjectURL(blob), size: blob.size });
      onImageReady(blob);
      resetSelection();
    } catch {
      setError("Não foi possível processar a imagem.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRemove = () => {
    if (preview) URL.revokeObjectURL(preview.url);
    setPreview(null);
    resetSelection();
    onImageReady(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="flex flex-col gap-3">
      {!imageSrc && !preview && (
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="sr-only"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex w-full flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-white/25 bg-dusk-900 px-6 py-10 text-center transition-colors hover:border-white/45 hover:bg-white/5 light:border-ink/25 light:bg-paper-dim light:hover:border-ink/45 light:hover:bg-black/5"
          >
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.75}
              className="text-cream-dim opacity-80 light:text-ink-dim light:opacity-100"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="M21 15l-5-5L5 21" />
            </svg>
            <span className="text-sm font-medium text-cream light:text-ink">Escolher foto</span>
            <span className="text-xs text-cream-dim opacity-70 light:text-ink-dim light:opacity-100">JPG ou PNG</span>
          </button>
        </div>
      )}

      {imageSrc && (
        <div className="flex flex-col gap-3">
          <div className="relative h-64 w-full overflow-hidden rounded-2xl bg-dusk-950">
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={ASPECT_RATIO}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={handleCropComplete}
            />
          </div>
          <input
            type="range"
            min={1}
            max={3}
            step={0.01}
            value={zoom}
            onChange={(event) => setZoom(Number(event.target.value))}
            aria-label="Zoom da imagem"
            className="w-full"
          />
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={resetSelection}
              className="rounded-full border border-white/15 px-4 py-2 text-sm font-medium opacity-85 hover:opacity-100 light:border-ink/15"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleApply}
              disabled={isProcessing}
              className="rounded-full bg-sun-core px-4 py-2 text-sm font-bold text-ink disabled:opacity-60"
            >
              {isProcessing ? "Processando..." : "Aplicar corte"}
            </button>
          </div>
        </div>
      )}

      {preview && (
        <div className="flex items-center gap-3">
          <img src={preview.url} alt="Pré-visualização da foto" className="h-20 w-20 rounded-xl object-cover" />
          <div className="flex flex-col gap-1">
            <span className="text-xs text-cream-dim opacity-70 light:text-ink-dim light:opacity-100">
              {Math.round(preview.size / 1024)} KB
            </span>
            <button
              type="button"
              onClick={handleRemove}
              className="text-left text-sm font-medium text-cream-dim underline opacity-80 hover:opacity-100 light:text-ink-dim light:opacity-100"
            >
              Trocar imagem
            </button>
          </div>
        </div>
      )}

      {error && <p className="text-sm text-sun-deep">{error}</p>}
    </div>
  );
}
