import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Termos de Uso — Sunset" };

export default function TermsOfUsePage() {
  return (
    <div className="px-[5vw] py-32">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-2 font-display text-3xl font-semibold">Termos de Uso</h1>
        <p className="mb-10 font-mono text-xs text-cream-dim opacity-70 light:text-ink-dim light:opacity-100">
          Última atualização: 23 de setembro de 2026
        </p>

        <div className="flex flex-col gap-8 text-sm leading-relaxed text-cream-dim light:text-ink-dim">
          <section>
            <p>
              Ao criar uma conta no Sunset, você concorda com estes termos. Se não concordar, por favor não use a
              plataforma.
            </p>
          </section>

          <section>
            <h2 className="mb-3 font-display text-xl font-semibold text-cream light:text-ink">O que é o Sunset</h2>
            <p>
              O Sunset é uma plataforma onde usuários pesquisam locais com belas visões de pôr do sol, postam fotos
              marcando o local, curtem, comentam e avaliam esses locais.
            </p>
          </section>

          <section>
            <h2 className="mb-3 font-display text-xl font-semibold text-cream light:text-ink">Sua conta</h2>
            <ul className="flex flex-col gap-2 list-disc pl-5">
              <li>Você precisa fornecer um e-mail válido e é responsável por manter sua senha em sigilo.</li>
              <li>Você é responsável por tudo que acontece através da sua conta.</li>
              <li>
                Você pode excluir sua conta a qualquer momento em &ldquo;Excluir minha conta&rdquo;, no menu do seu
                perfil — veja o que acontece com seu conteúdo na nossa{" "}
                <Link href="/privacidade" className="underline">
                  Política de Privacidade
                </Link>
                .
              </li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 font-display text-xl font-semibold text-cream light:text-ink">Conteúdo que você publica</h2>
            <ul className="flex flex-col gap-2 list-disc pl-5">
              <li>Você mantém os direitos autorais sobre as fotos e textos que publica.</li>
              <li>
                Ao publicar, você autoriza o Sunset a exibir esse conteúdo publicamente dentro da plataforma
                (necessário pro funcionamento do serviço: feed, perfil, página do local).
              </li>
              <li>
                Você só pode publicar conteúdo que tenha o direito de compartilhar, e que não viole a lei ou direitos
                de terceiros (imagem, autoral, etc.).
              </li>
              <li>
                Não é permitido publicar conteúdo ilegal, ofensivo, discriminatório, ou que assedie outras pessoas.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 font-display text-xl font-semibold text-cream light:text-ink">Moderação</h2>
            <p>
              Podemos remover conteúdo que viole estes termos e, em casos graves ou de reincidência, suspender ou
              encerrar contas.
            </p>
          </section>

          <section>
            <h2 className="mb-3 font-display text-xl font-semibold text-cream light:text-ink">Dados de terceiros</h2>
            <p>
              Informações como mapa do local e horário do pôr do sol vêm de serviços externos (Google Maps e
              sunrise-sunset.org) e podem estar sujeitas a atraso, indisponibilidade ou imprecisão — não nos
              responsabilizamos pela exatidão desses dados de terceiros.
            </p>
          </section>

          <section>
            <h2 className="mb-3 font-display text-xl font-semibold text-cream light:text-ink">Alterações nestes termos</h2>
            <p>
              Podemos atualizar estes termos eventualmente. A data no topo da página sempre reflete a versão mais
              recente.
            </p>
          </section>

          <section>
            <h2 className="mb-3 font-display text-xl font-semibold text-cream light:text-ink">Lei aplicável</h2>
            <p>Estes termos são regidos pelas leis do Brasil.</p>
          </section>

          <p className="border-t border-white/8 pt-6 text-xs opacity-70 light:border-line light:opacity-100">
            Este documento foi elaborado com base no funcionamento técnico atual da aplicação e ainda não passou por
            revisão jurídica formal — trate-o como uma minuta até a revisão de um advogado.
          </p>

          <p>
            Veja também a{" "}
            <Link href="/privacidade" className="underline">
              Política de Privacidade
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
