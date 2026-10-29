import type { Metadata } from "next";
import localFont from "next/font/local";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import AppProviders from "@/components/layout/AppProviders";
import { SITE_URL } from "@/lib/utils/siteUrl";
import "./globals.css";

// As três famílias são locais (app/fonts) em vez de next/font/google: evita depender do
// download das fontes do Google durante o build/deploy. Só os arquivos usados ficam no repo.
// Os arquivos são WOFF2 com subconjunto latino (cobre pt-BR, pontuação e setas): ~28% do
// tamanho dos TTF originais. Se o site passar a usar outro símbolo, ele cai na fonte do
// sistema, igual aos emojis do PhotoCard, que nenhuma dessas fontes tem.

// Fraunces 72pt (tamanho óptico de título). Não há arquivo Medium: o Regular cobre 400–500.
const fraunces = localFont({
  variable: "--font-display",
  src: [
    { path: "./fonts/Fraunces_72pt-Regular.woff2", weight: "400 500", style: "normal" },
    { path: "./fonts/Fraunces_72pt-SemiBold.woff2", weight: "600", style: "normal" },
    { path: "./fonts/Fraunces_72pt-Italic.woff2", weight: "400 500", style: "italic" },
  ],
  display: "swap",
});

const karla = localFont({
  variable: "--font-body",
  src: [
    { path: "./fonts/Karla-Regular.woff2", weight: "400", style: "normal" },
    { path: "./fonts/Karla-Medium.woff2", weight: "500", style: "normal" },
    { path: "./fonts/Karla-Bold.woff2", weight: "700", style: "normal" },
  ],
  display: "swap",
});

const jetbrainsMono = localFont({
  variable: "--font-mono",
  src: [
    { path: "./fonts/JetBrainsMono-Regular.woff2", weight: "400", style: "normal" },
    { path: "./fonts/JetBrainsMono-Medium.woff2", weight: "500", style: "normal" },
  ],
  display: "swap",
  // Só aparece em detalhes pequenos (contadores, coordenadas), nunca no que vale pro LCP:
  // não precisa disputar banda com as fontes do título e do texto no carregamento.
  preload: false,
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  // `default` vale pra home; as demais páginas passam só o próprio título e o template
  // acrescenta " — Sunsetsss".
  title: { default: "Sunsetsss — Encontre o melhor pôr do sol", template: "%s — Sunsetsss" },
  description:
    "Pesquise locais com as mais bonitas visões de pôr do sol, poste fotos, curta, comente e avalie os locais.",
  openGraph: {
    type: "website",
    siteName: "Sunsetsss",
    locale: "pt_BR",
    // Resolvido contra o metadataBase acima.
    images: ["/images/logo-vertical.png"],
  },
};

const THEME_INIT_SCRIPT = `
(function () {
  try {
    var stored = localStorage.getItem("sunset-theme");
    // Sem escolha salva, o padrão é light (não segue o tema do sistema).
    var theme = stored === "dark" ? "dark" : "light";
    document.documentElement.dataset.theme = theme;
  } catch (e) {}
})();
`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      suppressHydrationWarning
      className={`${fraunces.variable} ${karla.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="min-h-full flex flex-col bg-dusk-950 text-cream font-body light:bg-paper light:text-ink">
        <AppProviders>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </AppProviders>
      </body>
    </html>
  );
}
