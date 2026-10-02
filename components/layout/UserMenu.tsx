"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { useAuth } from "@/lib/hooks/useAuth";
import type { User } from "@/types/user";

interface UserMenuProps {
  user: User;
}

const menuItemClass =
  "block w-full px-4 py-2.5 text-left text-sm font-medium opacity-85 hover:opacity-100 hover:bg-white/5 light:hover:bg-black/5";

export default function UserMenu({ user }: UserMenuProps) {
  const { logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [confirmLogoutOpen, setConfirmLogoutOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) setIsOpen(false);
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const handleConfirmLogout = async () => {
    setIsLoggingOut(true);
    await logout();
    setIsLoggingOut(false);
    setConfirmLogoutOpen(false);
    setIsOpen(false);
  };

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        className="flex items-center gap-1.5 text-sm font-medium opacity-85 hover:opacity-100"
      >
        {user.name}
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={`transition-transform ${isOpen ? "rotate-180" : ""}`}>
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {isOpen && (
        <div
          role="menu"
          className="absolute top-full right-0 z-20 mt-3 w-48 overflow-hidden rounded-2xl border border-white/10 bg-dusk-900 py-1.5 shadow-[0_12px_40px_rgba(21,10,38,0.35)] light:border-line light:bg-paper"
        >
          <Link href={`/profile/${user.id}`} onClick={() => setIsOpen(false)} className={menuItemClass}>
            Perfil
          </Link>
          {user.role !== "User" && (
            <Link href="/moderation" onClick={() => setIsOpen(false)} className={menuItemClass}>
              Moderação
            </Link>
          )}
          <button type="button" onClick={() => setConfirmLogoutOpen(true)} className={`${menuItemClass} text-sun-deep`}>
            Sair
          </button>
        </div>
      )}

      <ConfirmDialog
        open={confirmLogoutOpen}
        title="Sair da conta?"
        description="Você precisará entrar novamente para curtir, comentar ou avaliar locais."
        confirmLabel="Sair"
        isConfirming={isLoggingOut}
        onConfirm={handleConfirmLogout}
        onCancel={() => setConfirmLogoutOpen(false)}
      />
    </div>
  );
}
