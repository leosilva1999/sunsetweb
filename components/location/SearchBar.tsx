"use client";

import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { searchLocations } from "@/lib/api/locations";
import { ApiError } from "@/lib/api/client";
import type { Location } from "@/types/location";

interface SearchBarProps {
  placeholder?: string;
  defaultValue?: string;
}

const SUGGESTIONS_LIMIT = 5;
const DEBOUNCE_MS = 300;
const RATE_LIMIT_COOLDOWN_MS = 10_000;

export default function SearchBar({
  placeholder = "Buscar por cidade, praia ou mirante...",
  defaultValue = "",
}: SearchBarProps) {
  const router = useRouter();
  const [query, setQuery] = useState(defaultValue);
  const [suggestions, setSuggestions] = useState<Location[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rateLimitedUntil, setRateLimitedUntil] = useState(0);
  const [dropdownRect, setDropdownRect] = useState<{ top: number; left: number; width: number } | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const requestIdRef = useRef(0);
  // Selecionar uma sugestão muda `query` pro nome escolhido, o que re-dispararia
  // o efeito de busca abaixo e reabriria o dropdown com o próprio local já
  // selecionado como "sugestão" — essa flag pula essa única próxima busca.
  const skipNextSearchRef = useRef(false);
  const [wasEmpty, setWasEmpty] = useState(!defaultValue.trim());

  // Ajusta o estado durante a renderização (não num efeito) quando a busca
  // esvazia — padrão recomendado pelo React pra "resetar ao mudar um valor".
  const isEmptyNow = !query.trim();
  if (isEmptyNow !== wasEmpty) {
    setWasEmpty(isEmptyNow);
    if (isEmptyNow) {
      setSuggestions([]);
      setIsOpen(false);
    }
  }

  // API é segura de chamar a cada tecla (tem FULLTEXT por trás), mas o próprio
  // doc pede debounce no frontend mesmo assim — o rate limit (40 req/10s) é só
  // um piso de proteção do banco, não uma licença pra não debounçar.
  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) return;
    if (skipNextSearchRef.current) {
      skipNextSearchRef.current = false;
      return;
    }
    if (Date.now() < rateLimitedUntil) return;

    const requestId = ++requestIdRef.current;
    const timeoutId = setTimeout(async () => {
      setIsLoading(true);
      try {
        const page = await searchLocations({ q: trimmed, limit: SUGGESTIONS_LIMIT });
        if (requestId === requestIdRef.current) {
          setSuggestions(page.items);
          setIsOpen(true);
        }
      } catch (err) {
        if (err instanceof ApiError && err.status === 429) {
          setRateLimitedUntil(Date.now() + RATE_LIMIT_COOLDOWN_MS);
        }
      } finally {
        if (requestId === requestIdRef.current) setIsLoading(false);
      }
    }, DEBOUNCE_MS);

    return () => clearTimeout(timeoutId);
  }, [query, rateLimitedUntil]);

  // O dropdown é renderizado num portal pro <body> — o hero tem overflow-hidden
  // (pra conter o fundo animado) que cortaria a lista de sugestões se ela fosse
  // filha normal do formulário.
  useEffect(() => {
    if (!isOpen) return;
    const updateRect = () => {
      const el = wrapperRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      setDropdownRect({ top: rect.bottom + 8, left: rect.left, width: rect.width });
    };
    updateRect();
    window.addEventListener("resize", updateRect);
    window.addEventListener("scroll", updateRect, true);
    return () => {
      window.removeEventListener("resize", updateRect);
      window.removeEventListener("scroll", updateRect, true);
    };
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      // O dropdown mora num portal fora de wrapperRef (foge do overflow-hidden do
      // hero) — sem checar dropdownRef também, um clique numa sugestão conta como
      // "fora", fecha o dropdown e desmonta o botão antes do onClick disparar.
      if (wrapperRef.current?.contains(target)) return;
      if (dropdownRef.current?.contains(target)) return;
      setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    setIsOpen(false);
    const params = new URLSearchParams(query ? { q: query } : undefined);
    router.push(`/locations?${params}`);
  };

  const handleSelect = (location: Location) => {
    skipNextSearchRef.current = true;
    setIsOpen(false);
    setQuery(location.name);
    router.push(`/locations/${location.id}`);
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Escape") setIsOpen(false);
  };

  return (
    <div ref={wrapperRef} className="relative w-full max-w-xl">
      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-2.5 rounded-full bg-white/92 py-2 pr-2 pl-5 shadow-[0_12px_40px_rgba(21,10,38,0.25)]"
      >
        <input
          type="text"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onFocus={() => suggestions.length > 0 && setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          role="combobox"
          aria-expanded={isOpen}
          aria-controls="searchbar-listbox"
          aria-autocomplete="list"
          autoComplete="off"
          className="flex-1 border-none bg-transparent font-body text-[0.98rem] text-ink placeholder:text-[#8a7d6f] focus:outline-none"
        />
        <button
          type="submit"
          className="rounded-full bg-ink px-6.5 py-3 text-sm font-bold text-cream transition-colors hover:bg-dusk-800"
        >
          Buscar
        </button>
      </form>

      {typeof document !== "undefined" &&
        isOpen &&
        dropdownRect &&
        createPortal(
          <div
            ref={dropdownRef}
            id="searchbar-listbox"
            role="listbox"
            style={{ position: "fixed", top: dropdownRect.top, left: dropdownRect.left, width: dropdownRect.width }}
            className="z-50 overflow-hidden rounded-2xl bg-white shadow-[0_12px_40px_rgba(21,10,38,0.25)]"
          >
            {suggestions.length === 0 ? (
              <p className="px-5 py-4 text-sm text-[#8a7d6f]">{isLoading ? "Buscando..." : "Nenhum local encontrado."}</p>
            ) : (
              suggestions.map((location) => (
                <button
                  key={location.id}
                  type="button"
                  role="option"
                  aria-selected={false}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => handleSelect(location)}
                  className="flex w-full flex-col items-start gap-0.5 px-5 py-3 text-left hover:bg-black/5"
                >
                  <span className="font-medium text-ink">{location.name}</span>
                  <span className="font-mono text-xs text-[#8a7d6f]">{location.city}</span>
                </button>
              ))
            )}
          </div>,
          document.body,
        )}
    </div>
  );
}
