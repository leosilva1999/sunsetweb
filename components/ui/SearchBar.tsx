"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

interface SearchBarProps {
  placeholder?: string;
  defaultValue?: string;
}

export default function SearchBar({
  placeholder = "Buscar por cidade, praia ou mirante...",
  defaultValue = "",
}: SearchBarProps) {
  const router = useRouter();
  const [query, setQuery] = useState(defaultValue);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const params = new URLSearchParams(query ? { q: query } : undefined);
    router.push(`/locations?${params}`);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex max-w-xl items-center gap-2.5 rounded-full bg-white/92 py-2 pr-2 pl-5 shadow-[0_12px_40px_rgba(21,10,38,0.25)]"
    >
      <input
        type="text"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder={placeholder}
        className="flex-1 border-none bg-transparent font-body text-[0.98rem] text-ink placeholder:text-[#8a7d6f] focus:outline-none"
      />
      <button
        type="submit"
        className="rounded-full bg-ink px-6.5 py-3 text-sm font-bold text-cream transition-colors hover:bg-dusk-800"
      >
        Buscar
      </button>
    </form>
  );
}
