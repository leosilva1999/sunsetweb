"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import ThemeToggle from "@/components/ui/ThemeToggle";

const linkClass =
  "block w-full px-4 py-2.5 text-left text-sm font-medium opacity-85 hover:opacity-100 hover:bg-white/5 light:hover:bg-black/5";

// Só existe em telas de celular (md:hidden no root) - em telas maiores os links
// e o ThemeToggle já aparecem direto na navbar (ver Navbar.tsx), então duplicar
// este componente lá seria mostrar a mesma coisa duas vezes.
export default function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);
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

  return (
    <div ref={wrapperRef} className="relative justify-self-start md:hidden">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-label={isOpen ? "Fechar menu" : "Abrir menu"}
        className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-cream light:border-ink/15 light:text-ink"
      >
        {isOpen ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M4 7h16M4 12h16M4 17h16" />
          </svg>
        )}
      </button>

      {isOpen && (
        <div
          role="menu"
          className="absolute top-full left-0 z-20 mt-3 w-52 overflow-hidden rounded-2xl border border-white/10 bg-dusk-900 py-1.5 shadow-[0_12px_40px_rgba(21,10,38,0.35)] light:border-line light:bg-paper"
        >
          <Link href="/ranking" onClick={() => setIsOpen(false)} className={linkClass}>
            Rankings
          </Link>
          <Link href="/locations" onClick={() => setIsOpen(false)} className={linkClass}>
            Explorar
          </Link>
          <Link href="/photos" onClick={() => setIsOpen(false)} className={linkClass}>
            Feed
          </Link>
          <div className="my-1.5 border-t border-white/8 light:border-line" />
          <div className="flex items-center justify-between px-4 py-2.5">
            <span className="text-sm font-medium opacity-85">Tema</span>
            <ThemeToggle />
          </div>
        </div>
      )}
    </div>
  );
}
