import type { Area } from "react-easy-crop";

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", () => reject(new Error("Falha ao carregar a imagem")));
    image.src = src;
  });
}

// Recorta a área selecionada e redimensiona pro maior lado não passar de
// maxDimension, reexportando como JPEG — evita subir pro servidor uma foto de
// câmera/celular (às vezes dezenas de MB) sem necessidade.
export async function getCroppedImageBlob(
  imageSrc: string,
  cropArea: Area,
  maxDimension: number,
  quality: number,
): Promise<Blob> {
  const image = await loadImage(imageSrc);

  const scale = Math.min(1, maxDimension / Math.max(cropArea.width, cropArea.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(cropArea.width * scale);
  canvas.height = Math.round(cropArea.height * scale);

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D context not available");

  ctx.drawImage(image, cropArea.x, cropArea.y, cropArea.width, cropArea.height, 0, 0, canvas.width, canvas.height);

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("Falha ao gerar a imagem"))), "image/jpeg", quality);
  });
}
