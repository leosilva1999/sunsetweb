"use client";

import { useEffect, useState } from "react";
import { searchCitiesForRegistration } from "@/lib/api/cities";
import { cityLabel, type CityOption } from "@/lib/utils/cityLabel";

interface CityPickerProps {
  value: CityOption | null;
  // Chamado só quando a pessoa escolhe (ou troca) a cidade; sugestões automáticas vêm de fora.
  onSelect: (city: CityOption) => void;
}

const MIN_QUERY_LENGTH = 2;
const DEBOUNCE_MS = 300;

const INPUT_CLASS =
  "w-full rounded-full border border-white/15 bg-transparent px-5 py-3 text-sm text-cream placeholder:text-cream-dim focus:border-white/40 focus:outline-none light:border-ink/15 light:text-ink light:placeholder:text-ink-dim light:focus:border-ink/40";

// Autocomplete de cidade do cadastro de local: o catálogo inteiro (municípios e localidades),
// mais populosas primeiro. Escolhida a cidade, mostra um chip com opção de trocar.
export default function CityPicker({ value, onSelect }: CityPickerProps) {
  const [isChanging, setIsChanging] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<CityOption[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchFailed, setSearchFailed] = useState(false);

  const trimmed = query.trim();
  const canSearch = trimmed.length >= MIN_QUERY_LENGTH;
  const showInput = !value || isChanging;

  useEffect(() => {
    if (!showInput || !canSearch) return;

    let cancelled = false;
    const timeoutId = setTimeout(async () => {
      setIsSearching(true);
      setSearchFailed(false);
      try {
        const page = await searchCitiesForRegistration(trimmed);
        if (!cancelled) setResults(page.items);
      } catch {
        if (!cancelled) {
          setResults([]);
          setSearchFailed(true);
        }
      } finally {
        if (!cancelled) setIsSearching(false);
      }
    }, DEBOUNCE_MS);

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, [showInput, canSearch, trimmed]);

  const handlePick = (city: CityOption) => {
    onSelect(city);
    setIsChanging(false);
    setQuery("");
    setResults([]);
  };

  if (!showInput && value) {
    return (
      <div className="flex items-center justify-between gap-3 rounded-full border border-white/15 px-5 py-3 text-sm light:border-ink/15">
        <span>
          <span className="mr-2 font-mono text-xs text-cream-dim opacity-70 light:text-ink-dim light:opacity-100">Cidade</span>
          {cityLabel(value)}
        </span>
        <button
          type="button"
          onClick={() => setIsChanging(true)}
          className="text-xs font-medium text-sun-mid hover:opacity-80 light:text-sun-deep"
        >
          Trocar
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      <input
        type="text"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Cidade ou localidade (ex.: Imbituba)"
        autoComplete="off"
        aria-label="Cidade"
        className={INPUT_CLASS}
      />
      {canSearch && (
        <div className="mt-2 rounded-2xl border border-white/10 p-2 text-sm light:border-line">
          {isSearching && results.length === 0 && <p className="px-3 py-2 opacity-70">Buscando...</p>}
          {searchFailed && <p className="px-3 py-2 text-sun-deep">Não foi possível buscar agora. Tente de novo.</p>}
          {!isSearching && !searchFailed && results.length === 0 && <p className="px-3 py-2 opacity-70">Nenhuma cidade encontrada.</p>}
          {results.length > 0 && (
            <ul>
              {results.map((city) => (
                <li key={city.id}>
                  <button
                    type="button"
                    onClick={() => handlePick(city)}
                    className="w-full rounded-xl px-3 py-2 text-left hover:bg-white/5 light:hover:bg-black/5"
                  >
                    {cityLabel(city)}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
      {value && (
        <button
          type="button"
          onClick={() => {
            setIsChanging(false);
            setQuery("");
            setResults([]);
          }}
          className="mt-2 text-xs text-cream-dim underline opacity-80 hover:opacity-100 light:text-ink-dim light:opacity-100"
        >
          Manter {cityLabel(value)}
        </button>
      )}
    </div>
  );
}
