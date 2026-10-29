// Host do storage das fotos. Precisa bater com `images.remotePatterns` em next.config.ts.
const STORAGE_HOSTNAME =
  process.env.NEXT_PUBLIC_STORAGE_HOSTNAME ?? "sunsetsss-photos-prod.s3.sa-east-1.amazonaws.com";

// Interruptor de emergência: se o otimizador de imagens der problema na hospedagem, basta
// definir NEXT_PUBLIC_UNOPTIMIZED_IMAGES=true e refazer o build pra servir as fotos originais.
const OPTIMIZATION_DISABLED = process.env.NEXT_PUBLIC_UNOPTIMIZED_IMAGES === "true";

// Só fotos do nosso bucket passam pelo otimizador. Qualquer outra URL (dado antigo, storage
// local de desenvolvimento) seguiria pro next/image e estouraria "hostname not configured",
// derrubando a página: ela é servida como está, sem otimização.
export function canOptimizePhoto(src: string): boolean {
  if (OPTIMIZATION_DISABLED) return false;
  try {
    const url = new URL(src);
    return url.protocol === "https:" && url.hostname === STORAGE_HOSTNAME && url.pathname.startsWith("/photos/");
  } catch {
    return false;
  }
}
