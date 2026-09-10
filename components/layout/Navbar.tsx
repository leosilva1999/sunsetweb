"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import ThemeToggle from "@/components/ui/ThemeToggle";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { useAuth } from "@/lib/hooks/useAuth";
import { useUploadModal } from "@/lib/hooks/useUploadModal";

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const { open: openUploadModal } = useUploadModal();
  const router = useRouter();
  const pathname = usePathname();
  const [confirmLogoutOpen, setConfirmLogoutOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleConfirmLogout = async () => {
    setIsLoggingOut(true);
    await logout();
    setIsLoggingOut(false);
    setConfirmLogoutOpen(false);
  };

  const handleUploadClick = () => {
    if (isAuthenticated) {
      openUploadModal();
    } else {
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
    }
  };

  return (
    <>
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
          <button onClick={handleUploadClick} className="opacity-85 hover:opacity-100">
            Postar foto
          </button>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          {isAuthenticated && user ? (
            <>
              <Link href={`/profile/${user.id}`} className="text-sm font-medium opacity-85 hover:opacity-100">
                {user.name}
              </Link>
              <button
                onClick={() => setConfirmLogoutOpen(true)}
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

      <ConfirmDialog
        open={confirmLogoutOpen}
        title="Sair da conta?"
        description="Você precisará entrar novamente para curtir, comentar ou avaliar locais."
        confirmLabel="Sair"
        isConfirming={isLoggingOut}
        onConfirm={handleConfirmLogout}
        onCancel={() => setConfirmLogoutOpen(false)}
      />
    </>
  );
}
