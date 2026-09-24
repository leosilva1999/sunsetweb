"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

interface KebabMenuProps {
  children: ReactNode;
  label?: string;
}

export default function KebabMenu({ children, label = "Mais opções" }: KebabMenuProps) {
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
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-label={label}
        className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 opacity-85 hover:opacity-100 hover:bg-white/5 light:border-ink/15 light:hover:bg-black/5"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="12" cy="5" r="2" />
          <circle cx="12" cy="12" r="2" />
          <circle cx="12" cy="19" r="2" />
        </svg>
      </button>

      {isOpen && (
        <div
          role="menu"
          className="absolute top-full right-0 z-20 mt-2 w-56 overflow-hidden rounded-2xl border border-white/10 bg-dusk-900 py-1.5 shadow-[0_12px_40px_rgba(21,10,38,0.35)] light:border-line light:bg-paper"
        >
          {children}
        </div>
      )}
    </div>
  );
}
