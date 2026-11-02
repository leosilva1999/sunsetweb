import { formatTime } from "@/lib/utils/formatDate";
import type { SunsetTime } from "@/types/location";

// Horário do pôr do sol de hoje. O sunrise-sunset.org exige o link de atribuição onde o dado
// aparece (a API não o injeta).
export default function SunsetTimeCard({ sunset }: { sunset: SunsetTime }) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-white/10 px-5 py-4 light:border-line light:bg-card">
      <svg viewBox="0 0 24 24" fill="none" stroke="var(--sun-core)" strokeWidth={2} className="h-8 w-8 shrink-0">
        <circle cx="12" cy="12" r="4" />
        <path d="M12 3v2M12 19v2M5 5l1.5 1.5M17.5 17.5 19 19M3 12h2M19 12h2M5 19l1.5-1.5M17.5 6.5 19 5" />
      </svg>
      <div>
        <p className="font-display text-lg font-semibold">Hoje o sol se põe às {formatTime(sunset.sunset, sunset.tzId)}</p>
        <p className="mt-1 font-mono text-xs text-cream-dim opacity-60 light:text-ink-dim light:opacity-100">
          Horário disponibilizado por:{" "}
          <a href="https://sunrise-sunset.org" target="_blank" rel="noopener noreferrer" className="underline hover:opacity-80">
            sunrise-sunset.org
          </a>
        </p>
      </div>
    </div>
  );
}
