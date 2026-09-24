import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Política de Privacidade — Sunset" };

export default function PrivacyPolicyPage() {
  return (
    <div className="px-[5vw] py-32">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-2 font-display text-3xl font-semibold">Política de Privacidade</h1>
        <p className="mb-10 font-mono text-xs text-cream-dim opacity-70 light:text-ink-dim light:opacity-100">
          Última atualização: 23 de setembro de 2026
        </p>

        <div className="flex flex-col gap-8 text-sm leading-relaxed text-cream-dim light:text-ink-dim">
          <section>
            <p>
              Esta política explica quais dados o Sunset coleta, para quê, e quais direitos você tem sobre eles,
              conforme a Lei Geral de Proteção de Dados (Lei nº 13.709/2018).
            </p>
          </section>

          <section>
            <h2 className="mb-3 font-display text-xl font-semibold text-cream light:text-ink">Quais dados coletamos</h2>
            <ul className="flex flex-col gap-2 list-disc pl-5">
              <li>
                <strong className="text-cream light:text-ink">Cadastro:</strong> nome, e-mail e senha (a senha nunca é
                armazenada em texto puro, só um hash criptográfico dela).
              </li>
              <li>
                <strong className="text-cream light:text-ink">Perfil:</strong> foto de avatar e biografia, se você
                optar por adicioná-las.
              </li>
              <li>
                <strong className="text-cream light:text-ink">Conteúdo que você publica:</strong> fotos, legendas,
                comentários e avaliações, sempre vinculados à sua conta.
              </li>
              <li>
                <strong className="text-cream light:text-ink">Dados de sessão:</strong> um token de acesso guardado no
                armazenamento local do seu navegador, usado só pra manter você logado — não usamos cookies de
                rastreamento nem analytics de terceiros.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 font-display text-xl font-semibold text-cream light:text-ink">Para que usamos esses dados</h2>
            <p>
              Para criar e autenticar sua conta, exibir seu perfil e conteúdo publicamente (como qualquer rede social
              de fotos), calcular rankings de locais a partir de curtidas e avaliações, e mostrar o horário do pôr do
              sol de cada local.
            </p>
            <p className="mt-3">
              A base legal é a execução do contrato que você aceita ao criar uma conta (Art. 7º, V da LGPD) e, quando
              aplicável, o seu consentimento (Art. 7º, I).
            </p>
          </section>

          <section>
            <h2 className="mb-3 font-display text-xl font-semibold text-cream light:text-ink">Com quem compartilhamos dados</h2>
            <ul className="flex flex-col gap-2 list-disc pl-5">
              <li>
                <strong className="text-cream light:text-ink">Armazenamento de imagens:</strong> suas fotos e avatar
                ficam hospedados num serviço de armazenamento de arquivos compatível com o padrão S3.
              </li>
              <li>
                <strong className="text-cream light:text-ink">Google Maps:</strong> ao abrir a página de um local que
                exibe o mapa, seu navegador faz uma requisição direta ao Google pra carregar esse mapa — isso expõe seu
                IP ao Google, sujeito à própria política de privacidade deles.
              </li>
              <li>
                <strong className="text-cream light:text-ink">sunrise-sunset.org:</strong> usamos esse serviço pra
                calcular o horário do pôr do sol de cada local. Só enviamos as coordenadas do local, nunca dados seus.
              </li>
            </ul>
            <p className="mt-3">Não vendemos nem alugamos seus dados pessoais a terceiros.</p>
          </section>

          <section>
            <h2 className="mb-3 font-display text-xl font-semibold text-cream light:text-ink">Seus direitos</h2>
            <p>Como titular dos dados, você pode, a qualquer momento (Art. 18 da LGPD):</p>
            <ul className="mt-3 flex flex-col gap-2 list-disc pl-5">
              <li>Acessar e corrigir seus dados a qualquer momento em &ldquo;Editar perfil&rdquo;.</li>
              <li>
                Baixar uma cópia dos seus dados (perfil e fotos publicadas) em &ldquo;Baixar meus dados&rdquo;, no menu
                do seu perfil.
              </li>
              <li>
                Excluir sua conta em &ldquo;Excluir minha conta&rdquo;, no mesmo menu. Isso apaga seu nome, e-mail,
                avatar e bio permanentemente — suas fotos, comentários e avaliações continuam visíveis pra manter a
                integridade das conversas e rankings de outras pessoas, mas passam a aparecer como de um &ldquo;Usuário
                excluído&rdquo;.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 font-display text-xl font-semibold text-cream light:text-ink">Por quanto tempo guardamos seus dados</h2>
            <p>
              Enquanto sua conta existir. Ao excluí-la, os dados que te identificam são apagados/anonimizados
              imediatamente, como descrito acima.
            </p>
          </section>

          <section>
            <h2 className="mb-3 font-display text-xl font-semibold text-cream light:text-ink">Segurança</h2>
            <p>
              Senhas são armazenadas com hash criptográfico (nunca em texto puro), e as conexões com nossos servidores
              usam HTTPS.
            </p>
          </section>

          <section>
            <h2 className="mb-3 font-display text-xl font-semibold text-cream light:text-ink">Crianças e adolescentes</h2>
            <p>
              O Sunset não é direcionado a menores de 18 anos e não coletamos intencionalmente dados de crianças sem o
              consentimento de um responsável legal.
            </p>
          </section>

          <section>
            <h2 className="mb-3 font-display text-xl font-semibold text-cream light:text-ink">Alterações nesta política</h2>
            <p>
              Podemos atualizar esta política eventualmente. A data no topo da página sempre reflete a versão mais
              recente.
            </p>
          </section>

          <section>
            <h2 className="mb-3 font-display text-xl font-semibold text-cream light:text-ink">Contato</h2>
            <p>
              Dúvidas sobre esta política ou sobre o tratamento dos seus dados? [Canal de contato a definir pela
              equipe do Sunset.]
            </p>
          </section>

          <p className="border-t border-white/8 pt-6 text-xs opacity-70 light:border-line light:opacity-100">
            Este documento foi elaborado com base no funcionamento técnico atual da aplicação e ainda não passou por
            revisão jurídica formal — trate-o como uma minuta até a revisão de um advogado ou encarregado de dados.
          </p>

          <p>
            Veja também os{" "}
            <Link href="/termos" className="underline">
              Termos de Uso
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
