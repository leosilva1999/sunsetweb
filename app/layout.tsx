import type { Metadata } from "next";
import localFont from "next/font/local";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import AppProviders from "@/components/layout/AppProviders";
import { SITE_URL } from "@/lib/utils/siteUrl";
import "./globals.css";

// As três famílias são locais (app/fonts) em vez de next/font/google: evita depender do
// download das fontes do Google durante o build/deploy. Só os arquivos usados ficam no repo.

// Fraunces 72pt (tamanho óptico de título). Não há arquivo Medium: o Regular cobre 400–500.
const fraunces = localFont({
  variable: "--font-display",
  src: [
    { path: "./fonts/Fraunces_72pt-Regular.ttf", weight: "400 500", style: "normal" },
    { path: "./fonts/Fraunces_72pt-SemiBold.ttf", weight: "600", style: "normal" },
    { path: "./fonts/Fraunces_72pt-Italic.ttf", weight: "400 500", style: "italic" },
  ],
  display: "swap",
});

const karla = localFont({
  variable: "--font-body",
  src: [
    { path: "./fonts/Karla-Regular.ttf", weight: "400", style: "normal" },
    { path: "./fonts/Karla-Medium.ttf", weight: "500", style: "normal" },
    { path: "./fonts/Karla-Bold.ttf", weight: "700", style: "normal" },
  ],
  display: "swap",
});

const jetbrainsMono = localFont({
  variable: "--font-mono",
  src: [
    { path: "./fonts/JetBrainsMono-Regular.ttf", weight: "400", style: "normal" },
    { path: "./fonts/JetBrainsMono-Medium.ttf", weight: "500", style: "normal" },
  ],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Sunsetsss — Encontre o melhor pôr do sol",
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
