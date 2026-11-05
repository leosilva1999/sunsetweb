"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/hooks/useAuth";
import { getGrowthStats, searchUsers } from "@/lib/api/moderation";
import { formatDate } from "@/lib/utils/formatDate";
import type { GrowthGranularity, GrowthMetric, GrowthPoint, GrowthStats } from "@/types/stats";
import type { User } from "@/types/user";

const RECENT_LIMIT = 5;

const GRANULARITIES: { value: GrowthGranularity; label: string }[] = [
  { value: "day", label: "30 dias" },
  { value: "week", label: "12 semanas" },
  { value: "month", label: "12 meses" },
];

const METRICS: { value: GrowthMetric; label: string; plural: string }[] = [
  { value: "users", label: "Usuários", plural: "usuários" },
  { value: "locations", label: "Locais", plural: "locais" },
  { value: "photos", label: "Fotos", plural: "fotos" },
  { value: "ratings", label: "Avaliações", plural: "avaliações" },
];

type Mode = "total" | "new";

const CHART_WIDTH = 640;
const CHART_HEIGHT = 220;
const PAD = { top: 16, right: 16, bottom: 28, left: 44 };

// "YYYY-MM-DD" é um dia do calendário de Brasília: monta a data em fuso local pra não deslocar
// o dia (new Date("2026-11-05") seria UTC e mostraria 04/11 no Brasil).
function parseDay(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function formatPeriod(date: string, granularity: GrowthGranularity) {
  const day = parseDay(date);
  if (granularity === "month") {
    return new Intl.DateTimeFormat("pt-BR", { month: "short", year: "numeric" }).format(day);
  }
  const text = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short" }).format(day);
  return granularity === "week" ? `semana de ${text}` : text;
}

function formatAxisDate(date: string, granularity: GrowthGranularity) {
  const day = parseDay(date);
  const options: Intl.DateTimeFormatOptions =
    granularity === "month" ? { month: "short", year: "2-digit" } : { day: "2-digit", month: "short" };
  return new Intl.DateTimeFormat("pt-BR", options).format(day);
}

const format = (value: number) => value.toLocaleString("pt-BR");

interface Loaded<T> {
  key: string;
  value: T;
}

interface GrowthDashboardProps {
  /** Leva o admin pra aba de usuários (busca e gestão), de onde dá pra ver todos. */
  onSeeMore: () => void;
}

export default function GrowthDashboard({ onSeeMore }: GrowthDashboardProps) {
  const { getAccessToken } = useAuth();
  const [granularity, setGranularity] = useState<GrowthGranularity>("day");
  const [metric, setMetric] = useState<GrowthMetric>("users");
  const [mode, setMode] = useState<Mode>("total");
  const [hovered, setHovered] = useState<number | null>(null);
  // Resultados marcados com a granularidade que os gerou: enquanto a escolhida ainda não
  // chegou, a tela mostra "carregando" sem precisar zerar estado dentro do efeito.
  const [stats, setStats] = useState<Loaded<GrowthStats> | null>(null);
  const [statsError, setStatsError] = useState<Loaded<string> | null>(null);
  const [recent, setRecent] = useState<{ users: User[]; hasMore: boolean } | null>(null);
  const [recentFailed, setRecentFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const token = await getAccessToken();
      if (cancelled) return;
      if (!token) {
        setStatsError({ key: granularity, value: "Sua sessão expirou. Entre novamente." });
        return;
      }
      try {
        const result = await getGrowthStats(granularity, token);
        if (!cancelled) setStats({ key: granularity, value: result });
      } catch {
        if (!cancelled) setStatsError({ key: granularity, value: "Não foi possível carregar as estatísticas agora." });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [granularity, getAccessToken]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const token = await getAccessToken();
        if (!token) return;
        const page = await searchUsers(token, undefined, undefined, RECENT_LIMIT);
        if (!cancelled) setRecent({ users: page.items, hasMore: page.hasMore });
      } catch {
        if (!cancelled) setRecentFailed(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [getAccessToken]);

  const current = stats?.key === granularity ? stats.value : null;
  const error = statsError?.key === granularity ? statsError.value : null;
  const points: GrowthPoint[] = current?.series[metric] ?? [];
  const metricInfo = METRICS.find((m) => m.value === metric)!;

  const getValue = (point: GrowthPoint) => (mode === "total" ? point.total : point.new);
  const maxValue = Math.max(1, ...points.map(getValue));
  const plotWidth = CHART_WIDTH - PAD.left - PAD.right;
  const plotHeight = CHART_HEIGHT - PAD.top - PAD.bottom;
  const step = plotWidth / Math.max(points.length - 1, 1);
  const x = (i: number) => PAD.left + i * step;
  const y = (value: number) => PAD.top + plotHeight - (value / maxValue) * plotHeight;
  const line = points.map((p, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(p.total).toFixed(1)}`).join(" ");
  const area = points.length > 0 ? `${line} L${x(points.length - 1).toFixed(1)},${y(0)} L${x(0)},${y(0)} Z` : "";
  const barWidth = Math.max(Math.min(step * 0.7, 24), 2);
  const active = hovered !== null ? points[hovered] : null;
  const newInPeriod = points.reduce((sum, p) => sum + p.new, 0);
  const summary = current?.summary;

  return (
    <div className="flex flex-col gap-8">
      {summary && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Stat
            label="Usuários"
            value={format(summary.users)}
            note={`${format(summary.activeAccounts)} ativas · ${format(summary.removedAccounts)} removidas`}
          />
          <Stat label="Locais" value={format(summary.locations)} />
          <Stat label="Fotos" value={format(summary.photos)} />
          <Stat label="Avaliações" value={format(summary.ratings)} />
        </div>
      )}

      <section className="rounded-2xl border border-white/10 p-5 light:border-line light:bg-card">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h3 className="font-display text-lg font-medium">Crescimento</h3>
          <Pills options={GRANULARITIES} value={granularity} onChange={(value) => { setGranularity(value); setHovered(null); }} />
        </div>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <Pills options={METRICS} value={metric} onChange={(value) => { setMetric(value); setHovered(null); }} />
          <Pills
            options={[
              { value: "total" as Mode, label: "Total" },
              { value: "new" as Mode, label: "Novos por período" },
            ]}
            value={mode}
            onChange={(value) => { setMode(value); setHovered(null); }}
          />
        </div>

        {error ? (
          <p className="text-sm text-sun-deep">{error}</p>
        ) : !current ? (
          <p className="py-10 text-sm text-cream-dim opacity-70 light:text-ink-dim light:opacity-100">Carregando...</p>
        ) : (
          <>
            <svg
              viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
              role="img"
              aria-label={`${mode === "total" ? "Total acumulado" : "Novos por período"} de ${metricInfo.plural}`}
              className="w-full"
              onMouseLeave={() => setHovered(null)}
            >
              {[0, 0.5, 1].map((fraction) => {
                const value = Math.round(maxValue * fraction);
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
                      {format(value)}
                    </text>
                  </g>
                );
              })}
              {mode === "total" ? (
                <>
                  <path d={area} fill="var(--sun-core)" fillOpacity={0.18} />
                  <path d={line} fill="none" stroke="var(--sun-deep)" strokeWidth={2} strokeLinejoin="round" />
                  {active && hovered !== null && <circle cx={x(hovered)} cy={y(active.total)} r={4} fill="var(--sun-deep)" />}
                </>
              ) : (
                points.map((point, i) => (
                  <rect
                    key={point.date}
                    x={x(i) - barWidth / 2}
                    y={y(point.new)}
                    width={barWidth}
                    height={y(0) - y(point.new)}
                    rx={2}
                    fill="var(--sun-deep)"
                    fillOpacity={hovered === i ? 1 : 0.7}
                  />
                ))
              )}
              {points.length > 0 && (
                <>
                  <text x={PAD.left} y={CHART_HEIGHT - 8} textAnchor="start" className="fill-current font-mono text-[10px] opacity-60">
                    {formatAxisDate(points[0].date, granularity)}
                  </text>
                  <text
                    x={CHART_WIDTH - PAD.right}
                    y={CHART_HEIGHT - 8}
                    textAnchor="end"
                    className="fill-current font-mono text-[10px] opacity-60"
                  >
                    {formatAxisDate(points[points.length - 1].date, granularity)}
                  </text>
                </>
              )}
              {points.map((point, i) => (
                <rect
                  key={`hit-${point.date}`}
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
                ? `${formatPeriod(active.date, granularity)} · ${format(active.total)} ${metricInfo.plural} (${active.new > 0 ? `+${format(active.new)}` : "0"} no período)`
                : `${format(newInPeriod)} novos no período · passe o mouse sobre o gráfico para ver cada ponto.`}
            </p>
            <p className="mt-1 text-xs text-cream-dim opacity-70 light:text-ink-dim light:opacity-100">
              {metric === "users" &&
                "A curva inclui contas removidas, por isso só sobe; a data da remoção não é registrada."}
              {(metric === "locations" || metric === "photos") &&
                "Conta só o que está visível: o que a moderação ocultou sai do total desde a data de criação."}
              {metric === "ratings" && "Conta todas as avaliações."} Dias no horário de Brasília.
            </p>
          </>
        )}
      </section>

      <section>
        <h3 className="mb-3 font-display text-lg font-medium">Novos usuários</h3>
        {recentFailed ? (
          <p className="text-sm text-sun-deep">Não foi possível carregar os usuários recentes agora.</p>
        ) : !recent ? (
          <p className="text-sm text-cream-dim opacity-70 light:text-ink-dim light:opacity-100">Carregando...</p>
        ) : recent.users.length === 0 ? (
          <p className="text-sm text-cream-dim opacity-70 light:text-ink-dim light:opacity-100">
            Nenhum usuário cadastrado ainda.
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {recent.users.map((u) => (
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
        {recent?.hasMore && (
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

function Pills<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          aria-pressed={value === option.value}
          className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors ${
            value === option.value
              ? "border-cream bg-cream text-ink light:border-ink light:bg-ink light:text-paper"
              : "border-white/15 hover:border-white/40 light:border-line light:hover:border-sun-mid"
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

function Stat({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div className="rounded-2xl border border-white/10 p-5 light:border-line light:bg-card">
      <p className="font-mono text-xs tracking-[0.1em] text-cream-dim uppercase light:text-ink-dim">{label}</p>
      <p className="mt-2 font-display text-3xl font-semibold">{value}</p>
      {note && <p className="mt-1 font-mono text-xs text-cream-dim light:text-ink-dim">{note}</p>}
    </div>
  );
}
