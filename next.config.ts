import type { NextConfig } from "next";

// Host do storage das fotos (bucket S3 da API). Precisa bater com lib/utils/photoImage.ts,
// que decide por foto se ela pode passar pelo otimizador de imagens do Next.
const STORAGE_HOSTNAME =
  process.env.NEXT_PUBLIC_STORAGE_HOSTNAME ?? "sunsetsss-photos-prod.s3.sa-east-1.amazonaws.com";

const nextConfig: NextConfig = {
  images: {
    // Só as fotos do nosso bucket (/photos/**) podem ser otimizadas: o otimizador baixa a
    // URL no servidor, então liberar qualquer host seria um proxy aberto de imagens.
    remotePatterns: [{ protocol: "https", hostname: STORAGE_HOSTNAME, pathname: "/photos/**" }],
  },
  async rewrites() {
    return [
      // IndexNow exige o arquivo de chave na raiz ("/{chave}.txt", 8 a 128 letras, números e
      // hífens). O handler só responde se a chave bater com INDEXNOW_KEY.
      { source: "/:key([A-Za-z0-9-]{8,128})\\.txt", destination: "/api/indexnow/:key" },
    ];
  },
  async headers() {
    return [
      {
        // Logos usados direto (og:image, JSON-LD). O Next já põe cache longo em /_next/static.
        source: "/images/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=604800, stale-while-revalidate=86400" }],
      },
    ];
  },
};

export default nextConfig;
