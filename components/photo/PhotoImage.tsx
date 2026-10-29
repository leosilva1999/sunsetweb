import Image from "next/image";
import { canOptimizePhoto } from "@/lib/utils/photoImage";

interface PhotoImageProps {
  src: string;
  alt: string;
  sizes: string;
  priority?: boolean;
}

// Foto que preenche o contêiner (que precisa ser `relative` e ter proporção definida).
// É um <img> de verdade, com alt: o que o Google Imagens indexa. Fotos do nosso bucket vão
// pelo otimizador do Next (WebP, tamanho certo pra tela); as demais, como estão.
export default function PhotoImage({ src, alt, sizes, priority }: PhotoImageProps) {
  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      unoptimized={!canOptimizePhoto(src)}
      className="object-cover"
    />
  );
}
