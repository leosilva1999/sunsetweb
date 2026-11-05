export type GrowthGranularity = "day" | "week" | "month";
export type GrowthMetric = "users" | "locations" | "photos" | "ratings";

export interface GrowthPoint {
  /** YYYY-MM-DD: primeiro dia do período (segunda-feira na semana, dia 1 no mês), em horário de Brasília. */
  date: string;
  /** Criados dentro do período. */
  new: number;
  /** Acumulado até o fim do período (inclui o que existia antes do `from`). */
  total: number;
}

export interface GrowthSummary {
  users: number;
  activeAccounts: number;
  removedAccounts: number;
  locations: number;
  photos: number;
  ratings: number;
}

// GET /moderation/stats/growth. `series` só traz as métricas pedidas em `metrics`.
export interface GrowthStats {
  granularity: string;
  timeZone: string;
  from: string;
  to: string;
  series: Partial<Record<GrowthMetric, GrowthPoint[]>>;
  summary: GrowthSummary;
}
