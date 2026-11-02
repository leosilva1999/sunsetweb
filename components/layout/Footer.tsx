import Link from "next/link";

export default function Footer() {
  return (
    <footer className="flex flex-wrap items-center justify-between gap-3.5 border-t border-white/8 px-[5vw] py-8 text-[0.82rem] text-cream-dim opacity-55 light:border-line light:text-ink-dim light:opacity-100">
      <div>
        <div>Sunsetsss · Encontre e compartilhe o melhor pôr do sol</div>
        {/* Atribuição exigida pela licença CC BY 4.0 dos dados de cidades e localidades. */}
        <div className="mt-1 text-[0.75rem]">
          Dados geográficos:{" "}
          <a href="https://www.geonames.org/" target="_blank" rel="noopener noreferrer" className="underline hover:opacity-100">
            GeoNames
          </a>{" "}
          (CC BY 4.0)
        </div>
      </div>
      <div className="flex items-center gap-5">
        <Link href="/privacidade" className="hover:opacity-100">
          Privacidade
        </Link>
        <Link href="/termos" className="hover:opacity-100">
          Termos
        </Link>
        <span>&copy; {new Date().getFullYear()}</span>
      </div>
    </footer>
  );
}
