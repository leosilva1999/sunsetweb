"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/lib/hooks/useAuth";
import { getAllUsers } from "@/lib/api/moderation";
import { buildGrowthSeries, countSince, type GrowthRange } from "@/lib/utils/userGrowth";
import { formatDate } from "@/lib/utils/formatDate";
import type { User } from "@/types/user";

const RECENT_LIMIT = 5;
const RANGES: { value: GrowthRange; label: string }[] = [
  { value: 30, label: "30 dias" },
  { value: 90, label: "90 dias" },
  { value: "all", label: "Tudo" },
];

const CHART_WIDTH = 640;
const CHART_HEIGHT = 220;
const PAD = { top: 16, right: 16, bottom: 28, left: 44 };

function formatShortDate(date: Date) {
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short" }).format(date);
}

interface UserGrowthProps {
  /** Leva o admin pra aba de usuários (busca e gestão), de onde dá pra ver todos. */
  onSeeMore: () => void;
}

export default function UserGrowth({ onSeeMore }: UserGrowthProps) {
  const { getAccessToken } = useAuth();
  const [users, setUsers] = useState<User[] | null>(null);
  const [truncated, setTruncated] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [range, setRange] = useState<GrowthRange>(30);
  const [hovered, setHovered] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const token = await getAccessToken();
        if (!token) {
          if (!cancelled) setError("Sua sessão expirou. Entre novamente.");
          return;
        }
        const result = await getAllUsers(token);
        if (cancelled) return;
        setUsers(result.users);
        setTruncated(result.truncated);
      } catch {
        if (!cancelled) setError("Não foi possível carregar os dados de usuários agora.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [getAccessToken]);

  const series = useMemo(() => (users ? buildGrowthSeries(users, range) : []), [users, range]);

  if (error) return <p className="text-sm text-sun-deep">{error}</p>;
  if (!users) {
    return <p className="text-sm text-cream-dim opacity-70 light:text-ink-dim light:opacity-100">Carregando...</p>;
  }

  const recent = users.slice(0, RECENT_LIMIT);
  const maxTotal = Math.max(1, ...series.map((p) => p.total));
  const plotWidth = CHART_WIDTH - PAD.left - PAD.right;
  const plotHeight = CHART_HEIGHT - PAD.top - PAD.bottom;
  const step = plotWidth / Math.max(series.length - 1, 1);
  const x = (i: number) => PAD.left + i * step;
  const y = (total: number) => PAD.top + plotHeight - (total / maxTotal) * plotHeight;
  const line = series.map((p, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(p.total).toFixed(1)}`).join(" ");
  const area = series.length > 0 ? `${line} L${x(series.length - 1).toFixed(1)},${y(0)} L${x(0)},${y(0)} Z` : "";
  const active = hovered !== null ? series[hovered] : null;

  return (
    <div className="flex flex-col gap-8">
      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Total de usuários" value={users.length.toLocaleString("pt-BR")} note={truncated ? "parcial" : undefined} />
        <Stat label="Novos em 7 dias" value={countSince(users, 7).toLocaleString("pt-BR")} />
        <Stat label="Novos em 30 dias" value={countSince(users, 30).toLocaleString("pt-BR")} />
      </div>
      {truncated && (
        <p className="text-xs text-sun-deep">
          Há mais usuários do que o limite de leitura desta tela: os números e o gráfico estão incompletos.
        </p>
      )}

      <section className="rounded-2xl border border-white/10 p-5 light:border-line light:bg-card">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h3 className="font-display text-lg font-medium">Crescimento</h3>
          <div className="flex gap-2">
            {RANGES.map((option) => (
              <button
                key={String(option.value)}
                onClick={() => {
                  setRange(option.value);
                  setHovered(null);
                }}
                aria-pressed={range === option.value}
                className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                  range === option.value
                    ? "border-cream bg-cream text-ink light:border-ink light:bg-ink light:text-paper"
                    : "border-white/15 hover:border-white/40 light:border-line light:hover:border-sun-mid"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <svg
          viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
          role="img"
          aria-label="Total acumulado de usuários ao longo do tempo"
          className="w-full"
          onMouseLeave={() => setHovered(null)}
        >
          {[0, 0.5, 1].map((fraction) => {
            const value = Math.round(maxTotal * fraction);
            return (
              <g key={fraction}>
                <line
                  x1={PAD.left}
                  x2={CHART_WIDTH - PAD.right}
                  y1={y(value)}
                  y2={y(value)}
                  stroke="currentColor"
                  strokeOpacity={0.12}
                />
                <text x={PAD.left - 8} y={y(value) + 4} textAnchor="end" className="fill-current font-mono text-[10px] opacity-60">
                  {value.toLocaleString("pt-BR")}
                </text>
              </g>
            );
          })}
          <path d={area} fill="var(--sun-core)" fillOpacity={0.18} />
          <path d={line} fill="none" stroke="var(--sun-deep)" strokeWidth={2} strokeLinejoin="round" />
          {series.length > 0 && (
            <>
              <text x={PAD.left} y={CHART_HEIGHT - 8} textAnchor="start" className="fill-current font-mono text-[10px] opacity-60">
                {formatShortDate(series[0].date)}
              </text>
              <text
                x={CHART_WIDTH - PAD.right}
                y={CHART_HEIGHT - 8}
                textAnchor="end"
                className="fill-current font-mono text-[10px] opacity-60"
              >
                {formatShortDate(series[series.length - 1].date)}
              </text>
            </>
          )}
          {active && hovered !== null && <circle cx={x(hovered)} cy={y(active.total)} r={4} fill="var(--sun-deep)" />}
          {series.map((point, i) => (
            <rect
              key={point.date.getTime()}
              x={x(i) - step / 2}
              y={PAD.top}
              width={step}
              height={plotHeight}
              fill="transparent"
              onMouseEnter={() => setHovered(i)}
            />
          ))}
        </svg>

        <p className="mt-2 min-h-5 font-mono text-xs text-cream-dim light:text-ink-dim">
          {active
            ? `${formatShortDate(active.date)} · ${active.total.toLocaleString("pt-BR")} usuários (${active.added > 0 ? `+${active.added}` : "0"} no dia)`
            : "Passe o mouse sobre o gráfico para ver o total de cada dia."}
        </p>
      </section>

      <section>
        <h3 className="mb-3 font-display text-lg font-medium">Novos usuários</h3>
        {recent.length === 0 ? (
          <p className="text-sm text-cream-dim opacity-70 light:text-ink-dim light:opacity-100">
            Nenhum usuário cadastrado ainda.
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {recent.map((u) => (
              <li
                key={u.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 p-4 light:border-line"
              >
                <div>
                  <p className="font-medium">{u.name}</p>
                  <p className="font-mono text-xs text-cream-dim opacity-70 light:text-ink-dim light:opacity-100">{u.email}</p>
                </div>
                <span className="font-mono text-xs text-cream-dim light:text-ink-dim">{formatDate(u.createdAt)}</span>
              </li>
            ))}
          </ul>
        )}
        {users.length > RECENT_LIMIT && (
          <button
            onClick={onSeeMore}
            className="mt-4 rounded-full border border-white/15 px-5 py-2.5 text-sm font-medium opacity-85 hover:opacity-100 light:border-ink/15"
          >
            Ver mais
          </button>
        )}
      </section>
    </div>
  );
}

function Stat({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div className="rounded-2xl border border-white/10 p-5 light:border-line light:bg-card">
      <p className="font-mono text-xs tracking-[0.1em] text-cream-dim uppercase light:text-ink-dim">{label}</p>
      <p className="mt-2 font-display text-3xl font-semibold">
        {value}
        {note && <span className="ml-2 font-mono text-xs font-normal text-sun-deep">{note}</span>}
      </p>
    </div>
  );
}
