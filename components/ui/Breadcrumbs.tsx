import Link from "next/link";

interface BreadcrumbItem {
  name: string;
  // Sem href = a página atual.
  href?: string;
}

// Trilha visível (Início › Cidades › Imbituba). Os mesmos itens vão pro JSON-LD
// (breadcrumbJsonLd) na página, pra a trilha aparecer também nos resultados do Google.
export default function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="Trilha de navegação" className="mb-6 font-mono text-xs text-cream-dim opacity-80 light:text-ink-dim light:opacity-100">
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
        {items.map((item, index) => (
          <li key={`${item.name}-${index}`} className="flex items-center gap-2">
            {index > 0 && <span aria-hidden="true">›</span>}
            {item.href ? (
              <Link href={item.href} className="underline-offset-2 hover:underline">
                {item.name}
              </Link>
            ) : (
              <span aria-current="page">{item.name}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
