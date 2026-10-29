interface JsonLdProps {
  data: Record<string, unknown> | Record<string, unknown>[];
}

// Dados estruturados (schema.org) pro Google. Renderiza no servidor, dentro do HTML.
export default function JsonLd({ data }: JsonLdProps) {
  // O "<" é escapado porque nomes de local, legendas etc. vêm de usuários: um "</script>"
  // no texto fecharia a tag e deixaria o resto do conteúdo escapar pro HTML da página.
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}
