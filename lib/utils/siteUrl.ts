// Origem pública do site. Usada em metadataBase, sitemap e robots — os três precisam
// concordar, por isso ficam centralizados aqui. NEXT_PUBLIC_SITE_URL permite apontar
// pra outro host (ex.: um staging) sem mexer no código.
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://sunsetsss.com").replace(/\/+$/, "");
