import type { Metadata } from "next";

// Usada quando a página não tem imagem própria (ex.: perfil sem avatar).
const FALLBACK_OG_IMAGE = "/images/logo-vertical.png";
const SITE_NAME = "Sunsetsss";

interface PageMetadata {
  // Sem o sufixo " — Sunsetsss": o `title.template` do layout acrescenta no <title>, e
  // aqui ele é acrescentado à mão nos títulos de prévia (og/twitter), que o template não cobre.
  title: string;
  description?: string;
  // Caminho da página (ex.: "/locations/abc"). Vira a URL canônica e o og:url.
  path: string;
  image?: string | null;
}

// O Next faz merge raso dos metadados: se a página define `openGraph`, ele SUBSTITUI o
// do layout por inteiro (siteName, locale, imagem...). Por isso o helper repete tudo,
// pra páginas com prévia própria não perderem o resto.
export function buildPageMetadata({ title, description, path, image }: PageMetadata): Metadata {
  const images = [image || FALLBACK_OG_IMAGE];
  const previewTitle = `${title} — ${SITE_NAME}`;
  return {
    title,
    ...(description ? { description } : {}),
    // Resolvido contra o metadataBase. Sem canonical, o Google pode tratar variações da mesma
    // página (www, parâmetros de busca) como páginas diferentes.
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      locale: "pt_BR",
      title: previewTitle,
      ...(description ? { description } : {}),
      url: path,
      images,
    },
    twitter: { card: "summary_large_image", title: previewTitle, ...(description ? { description } : {}), images },
  };
}

// Páginas que não devem aparecer na busca, mas cujos links podem ser seguidos.
export const NO_INDEX: Metadata = { robots: { index: false, follow: true } };
