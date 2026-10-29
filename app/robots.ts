import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/utils/siteUrl";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Áreas sem valor pra busca orgânica: moderação é restrita e as telas de
      // autenticação são formulários (e o link de reset de senha carrega um token).
      // As URLs com "?" (busca, "perto de mim", período do ranking, feed) só reordenam ou
      // filtram conteúdo que já existe nas páginas sem parâmetro: rastreá-las desperdiça o
      // orçamento de rastreio do Google. Os padrões terminam em "?" de propósito, pra NÃO
      // pegar /_next/image?url=..., que o Google precisa abrir pra renderizar as páginas.
      disallow: [
        "/moderation",
        "/login",
        "/register",
        "/forgot-password",
        "/reset-password",
        "/locations?",
        "/photos?",
        "/ranking?",
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
