import type { Metadata } from "next";
import Link from "next/link";
import { buildPageMetadata } from "@/lib/utils/shareMetadata";
import { CONTACT_EMAIL } from "@/lib/utils/contact";

export const metadata: Metadata = buildPageMetadata({
  title: "Contato",
  description: "Fale com a equipe do Sunsetsss: dúvidas, sugestões, problemas na conta ou pedidos sobre seus dados.",
  path: "/contato",
});

const TOPICS = [
  "Dúvidas e sugestões sobre o site",
  "Problemas com a sua conta ou com uma publicação",
  "Pedidos sobre os seus dados pessoais",
  "Parcerias e imprensa",
];

export default function ContactPage() {
  return (
    <div className="px-[5vw] py-32">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-4 font-display text-3xl font-semibold">Contato</h1>
        <p className="mb-8 text-lg leading-relaxed text-cream-dim light:text-ink-dim">
          Escreva para a gente por e-mail. Lemos todas as mensagens e respondemos assim que possível.
        </p>

        <a
          href={`mailto:${CONTACT_EMAIL}`}
          className="mb-10 inline-block rounded-2xl border border-white/10 px-6 py-5 font-mono text-base transition-colors hover:border-white/30 light:border-line light:bg-card light:hover:border-sun-mid"
        >
          {CONTACT_EMAIL}
        </a>

        <h2 className="mb-3 font-display text-xl font-semibold">Podemos ajudar com</h2>
        <ul className="mb-10 list-disc pl-5 text-sm leading-relaxed text-cream-dim light:text-ink-dim">
          {TOPICS.map((topic) => (
            <li key={topic}>{topic}</li>
          ))}
        </ul>

        <p className="border-t border-white/8 pt-6 text-sm leading-relaxed text-cream-dim light:border-line light:text-ink-dim">
          Para denunciar uma foto, comentário, local ou perfil, use a opção de denúncia no próprio conteúdo — assim a
          moderação recebe direto o que precisa analisar. Veja também os{" "}
          <Link href="/termos" className="underline">
            Termos de Uso
          </Link>{" "}
          e a{" "}
          <Link href="/privacidade" className="underline">
            Política de Privacidade
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
