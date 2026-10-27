import type { Metadata } from "next";

// Usada quando a página não tem imagem própria (ex.: perfil sem avatar).
const FALLBACK_OG_IMAGE = "/images/logo-vertical.png";

interface PageOpenGraph {
  title: string;
  description?: string;
  path: string;
  image?: string | null;
}

// O Next faz merge raso dos metadados: se a página define `openGraph`, ele SUBSTITUI o
// do layout por inteiro (siteName, locale, imagem...). Por isso o helper repete tudo,
// pra páginas com prévia própria não perderem o resto.
export function buildPageMetadata({ title, description, path, image }: PageOpenGraph): Metadata {
  const images = [image || FALLBACK_OG_IMAGE];
  return {
    title,
    ...(description ? { description } : {}),
    openGraph: {
      type: "website",
      siteName: "Sunsetsss",
      locale: "pt_BR",
      title,
      ...(description ? { description } : {}),
      url: path,
      images,
    },
    twitter: { card: "summary_large_image", title, ...(description ? { description } : {}), images },
  };
}
