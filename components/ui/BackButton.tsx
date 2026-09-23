"use client";

import { useRouter } from "next/navigation";

export default function BackButton() {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => router.back()}
      className="mb-6 inline-flex items-center gap-1.5 text-sm text-cream-dim opacity-70 hover:opacity-100 light:text-ink-dim light:opacity-100"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <path d="M19 12H5M12 19l-7-7 7-7" />
      </svg>
      Voltar
    </button>
  );
}
