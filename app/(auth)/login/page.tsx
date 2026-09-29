"use client";

import { Suspense, useState, type FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Button from "@/components/ui/Button";
import GoogleSignInButton from "@/components/ui/GoogleSignInButton";
import { useAuth } from "@/lib/hooks/useAuth";
import { ApiError } from "@/lib/api/client";
import { safeRedirectPath } from "@/lib/utils/safeRedirectPath";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, loginWithGoogle } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      await login(email, password);
      router.push(safeRedirectPath(searchParams.get("redirect")));
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setError("E-mail ou senha inválidos.");
      } else if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Não foi possível entrar agora. Tente novamente.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleCredential = async (idToken: string) => {
    setError(null);
    try {
      await loginWithGoogle(idToken);
      router.push(safeRedirectPath(searchParams.get("redirect")));
    } catch {
      setError("Não foi possível entrar com o Google agora. Tente novamente.");
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
      <h1 className="mb-8 text-center font-display text-2xl font-semibold">Entrar</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="E-mail"
          required
          className="rounded-full border border-white/15 bg-transparent px-5 py-3 text-sm text-cream placeholder:text-cream-dim focus:border-white/40 focus:outline-none light:border-ink/15 light:text-ink light:placeholder:text-ink-dim light:focus:border-ink/40"
        />
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Senha"
          required
          className="rounded-full border border-white/15 bg-transparent px-5 py-3 text-sm text-cream placeholder:text-cream-dim focus:border-white/40 focus:outline-none light:border-ink/15 light:text-ink light:placeholder:text-ink-dim light:focus:border-ink/40"
        />
        {error && <p className="text-sm text-sun-deep">{error}</p>}
        <Button type="submit" variant="accent" disabled={isSubmitting}>
          {isSubmitting ? "Entrando..." : "Entrar"}
        </Button>
      </form>
      <div className="my-6 flex items-center gap-3">
        <span className="h-px flex-1 bg-white/15 light:bg-ink/15" />
        <span className="text-xs text-cream-dim opacity-70 light:text-ink-dim light:opacity-100">ou</span>
        <span className="h-px flex-1 bg-white/15 light:bg-ink/15" />
      </div>
      <GoogleSignInButton onCredential={handleGoogleCredential} />
      <p className="mt-4 text-center text-xs text-cream-dim opacity-70 light:text-ink-dim light:opacity-100">
        Ao continuar com o Google, você concorda com os{" "}
        <Link href="/termos" target="_blank" className="underline">
          Termos de Uso
        </Link>{" "}
        e a{" "}
        <Link href="/privacidade" target="_blank" className="underline">
          Política de Privacidade
        </Link>
        .
      </p>
      <p className="mt-6 text-sm text-cream-dim opacity-70 light:text-ink-dim light:opacity-100">
        Não tem conta?{" "}
        <Link
          href={
            searchParams.get("redirect")
              ? `/register?redirect=${encodeURIComponent(searchParams.get("redirect")!)}`
              : "/register"
          }
          className="underline"
        >
          Cadastre-se
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
