"use client";

import { useState, type FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import Button from "@/components/ui/Button";
import { forgotPassword } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      await forgotPassword(email);
      setSent(true);
    } catch (err) {
      // A API já responde 204 pra e-mail desconhecido (não revela se existe conta) - só
      // 429 (rate limit) e 502 (SMTP fora do ar) chegam aqui como erro de verdade.
      if (err instanceof ApiError && err.status === 429) {
        setError("Muitas tentativas. Aguarde um pouco antes de tentar de novo.");
      } else if (err instanceof ApiError && err.status === 502) {
        setError("Não foi possível enviar o e-mail agora. Tente novamente em instantes.");
      } else {
        setError("Não foi possível enviar o e-mail agora. Tente novamente.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-sm px-[5vw] py-32">
      {/* SVGs locais - unoptimized evita a exigência de dangerouslyAllowSVG no config só pra um logo vetorial que já é pequeno. */}
      <Image src="/images/logo-vertical.svg" alt="Sunset" width={160} height={160} unoptimized className="mx-auto mb-10 h-24 w-auto light:hidden" />
      <Image
        src="/images/logo-vertical-light.svg"
        alt="Sunset"
        width={160}
        height={160}
        unoptimized
        className="mx-auto mb-10 hidden h-24 w-auto light:block"
      />
      <h1 className="mb-8 text-center font-display text-2xl font-semibold">Esqueci minha senha</h1>
      {sent ? (
        <p className="text-center text-sm text-cream-dim light:text-ink-dim">
          Se esse e-mail estiver cadastrado, você vai receber um link pra redefinir sua senha em
          instantes.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <p className="text-center text-sm text-cream-dim opacity-70 light:text-ink-dim light:opacity-100">
            Informe o e-mail da sua conta e enviaremos um link pra você escolher uma nova senha.
          </p>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="E-mail"
            required
            className="rounded-full border border-white/15 bg-transparent px-5 py-3 text-sm text-cream placeholder:text-cream-dim focus:border-white/40 focus:outline-none light:border-ink/15 light:text-ink light:placeholder:text-ink-dim light:focus:border-ink/40"
          />
          {error && <p className="text-sm text-sun-deep">{error}</p>}
          <Button type="submit" variant="accent" disabled={isSubmitting}>
            {isSubmitting ? "Enviando..." : "Enviar link"}
          </Button>
        </form>
      )}
      <p className="mt-6 text-sm text-cream-dim opacity-70 light:text-ink-dim light:opacity-100">
        <Link href="/login" className="underline">
          Voltar pro login
        </Link>
      </p>
    </div>
  );
}
