"use client";

import Link from "next/link";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { useAuth } from "@/lib/hooks/useAuth";

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <nav className="fixed inset-x-0 top-0 z-50 flex items-center justify-between bg-gradient-to-b from-dusk-950/85 to-transparent px-[5vw] py-5 backdrop-blur-[2px] light:from-paper/90">
      <Link href="/" className="flex items-center">
        <img src="/images/logo-horizontal.svg" alt="Sunset" className="h-8 w-auto light:hidden" />
        <img src="/images/logo-horizontal-light.svg" alt="Sunset" className="hidden h-8 w-auto light:block" />
      </Link>
      <div className="hidden gap-8 text-sm font-medium md:flex">
        <Link href="/ranking" className="opacity-85 hover:opacity-100">
          Rankings
        </Link>
        <Link href="/locations" className="opacity-85 hover:opacity-100">
          Explorar
        </Link>
        <Link href="/upload" className="opacity-85 hover:opacity-100">
          Postar foto
        </Link>
      </div>
      <div className="flex items-center gap-3">
        <ThemeToggle />
        {isAuthenticated && user ? (
          <>
            <Link href={`/profile/${user.id}`} className="text-sm font-medium opacity-85 hover:opacity-100">
              {user.name}
            </Link>
            <button
              onClick={() => logout()}
              className="rounded-full border border-white/15 px-4 py-2.5 text-sm font-medium opacity-85 hover:opacity-100 light:border-ink/15"
            >
              Sair
            </button>
          </>
        ) : (
          <Link
            href="/login"
            className="rounded-full bg-cream px-5 py-2.5 text-sm font-bold text-ink transition-transform hover:-translate-y-0.5 light:bg-ink light:text-paper"
          >
            Entrar
          </Link>
        )}
      </div>
    </nav>
  );
}
