"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { createPortal } from "react-dom";
import { searchLocations } from "@/lib/api/locations";
import { ApiError } from "@/lib/api/client";
import NewLocationModal from "@/components/location/NewLocationModal";
import type { Location } from "@/types/location";

interface LocationPickerProps {
  value: Location | null;
  onChange: (location: Location | null) => void;
  isAddingNew: boolean;
  onAddingNewChange: (open: boolean) => void;
}

const SUGGESTIONS_LIMIT = 6;
const DEBOUNCE_MS = 300;
const RATE_LIMIT_COOLDOWN_MS = 10_000;

export default function LocationPicker({ value, onChange, isAddingNew, onAddingNewChange }: LocationPickerProps) {
  const [query, setQuery] = useState(value?.name ?? "");
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
  const [wasEmpty, setWasEmpty] = useState(!query.trim());

  // Ajusta o estado durante a renderização (não num efeito) quando a busca
  // esvazia — mesmo padrão do SearchBar da home.
  const isEmptyNow = !query.trim();
  if (isEmptyNow !== wasEmpty) {
    setWasEmpty(isEmptyNow);
    if (isEmptyNow) setSuggestions([]);
  }

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
      if (wrapperRef.current?.contains(target)) return;
      if (dropdownRef.current?.contains(target)) return;
      setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (location: Location) => {
    skipNextSearchRef.current = true;
    setIsOpen(false);
    setQuery(location.name);
    onChange(location);
  };

  const handleQueryChange = (next: string) => {
    setQuery(next);
    if (value) onChange(null); // texto mudou — o valor selecionado não é mais válido
  };

  const handleCreated = (location: Location) => {
    skipNextSearchRef.current = true;
    onAddingNewChange(false);
    setIsOpen(false);
    setQuery(location.name);
    onChange(location);
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Escape") setIsOpen(false);
  };

  return (
    <div ref={wrapperRef} className="relative">
      <input
        type="text"
        value={query}
        onChange={(event) => handleQueryChange(event.target.value)}
        onFocus={() => query.trim() && setIsOpen(true)}
        onKeyDown={handleKeyDown}
        placeholder="Buscar o local da foto..."
        role="combobox"
        aria-expanded={isOpen}
        aria-controls="location-picker-listbox"
        aria-autocomplete="list"
        autoComplete="off"
        required
        className="w-full rounded-full border border-white/15 bg-transparent px-5 py-3 text-sm text-cream placeholder:text-cream-dim focus:border-white/40 focus:outline-none light:border-ink/15 light:text-ink light:placeholder:text-ink-dim light:focus:border-ink/40"
      />

      {typeof document !== "undefined" &&
        isOpen &&
        dropdownRect &&
        createPortal(
          <div
            ref={dropdownRef}
            id="location-picker-listbox"
            role="listbox"
            style={{ position: "fixed", top: dropdownRect.top, left: dropdownRect.left, width: dropdownRect.width }}
            className="z-[105] overflow-hidden rounded-2xl border border-white/10 bg-dusk-900 shadow-[0_12px_40px_rgba(21,10,38,0.35)] light:border-line light:bg-card"
          >
            {suggestions.length === 0 && (
              <p className="px-5 py-3 text-sm text-cream-dim opacity-70 light:text-ink-dim light:opacity-100">
                {isLoading ? "Buscando..." : "Nenhum local encontrado."}
              </p>
            )}
            {suggestions.map((location) => (
              <button
                key={location.id}
                type="button"
                role="option"
                aria-selected={false}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => handleSelect(location)}
                className="flex w-full flex-col items-start gap-0.5 px-5 py-3 text-left hover:bg-white/5 light:hover:bg-black/5"
              >
                <span className="font-medium">{location.name}</span>
                <span className="font-mono text-xs text-cream-dim opacity-70 light:text-ink-dim light:opacity-100">{location.city}</span>
              </button>
            ))}
            <button
              type="button"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => {
                onAddingNewChange(true);
                setIsOpen(false);
              }}
              className="flex w-full items-center gap-2 border-t border-white/10 px-5 py-3 text-left text-sm font-medium text-sun-mid hover:bg-white/5 light:border-line light:text-sun-deep light:hover:bg-black/5"
            >
              + Adicionar novo local{query.trim() ? ` "${query.trim()}"` : ""}
            </button>
          </div>,
          document.body,
        )}

      <NewLocationModal
        open={isAddingNew}
        initialName={query.trim()}
        onCreated={handleCreated}
        onSelectExisting={handleCreated}
        onCancel={() => onAddingNewChange(false)}
      />
    </div>
  );
}
