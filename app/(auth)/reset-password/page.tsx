"use client";

import { Suspense, useState, type FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Button from "@/components/ui/Button";
import { resetPassword } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (password !== confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }
    if (!token) return;

    setIsSubmitting(true);
    setError(null);
    try {
      await resetPassword(token, password);
      router.push("/login");
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setError("Esse link é inválido ou já expirou.");
      } else if (err instanceof ApiError && err.fieldErrors) {
        setError(Object.values(err.fieldErrors).flat().join(" "));
      } else {
        setError("Não foi possível redefinir sua senha agora. Tente novamente.");
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
      <h1 className="mb-8 text-center font-display text-2xl font-semibold">Redefinir senha</h1>
      {!token ? (
        <div className="text-center text-sm text-cream-dim light:text-ink-dim">
          <p>Esse link está incompleto ou é inválido.</p>
          <Link href="/forgot-password" className="mt-4 inline-block underline">
            Pedir um novo link
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Nova senha"
            required
            minLength={8}
            className="rounded-full border border-white/15 bg-transparent px-5 py-3 text-sm text-cream placeholder:text-cream-dim focus:border-white/40 focus:outline-none light:border-ink/15 light:text-ink light:placeholder:text-ink-dim light:focus:border-ink/40"
          />
          <input
            type="password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            placeholder="Confirme a nova senha"
            required
            minLength={8}
            className="rounded-full border border-white/15 bg-transparent px-5 py-3 text-sm text-cream placeholder:text-cream-dim focus:border-white/40 focus:outline-none light:border-ink/15 light:text-ink light:placeholder:text-ink-dim light:focus:border-ink/40"
          />
          {error && (
            <p className="text-sm text-sun-deep">
              {error}
              {error.startsWith("Esse link") && (
                <>
                  {" "}
                  <Link href="/forgot-password" className="underline">
                    Pedir um novo
                  </Link>
                  .
                </>
              )}
            </p>
          )}
          <Button type="submit" variant="accent" disabled={isSubmitting}>
            {isSubmitting ? "Salvando..." : "Redefinir senha"}
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

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  );
}
