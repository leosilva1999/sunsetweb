import type { User } from "@/types/user";

export interface GrowthPoint {
  /** Início do dia (fuso local). */
  date: Date;
  /** Usuários cadastrados até o fim desse dia. */
  total: number;
  /** Cadastros nesse dia. */
  added: number;
}

export type GrowthRange = 30 | 90 | "all";

const DAY_MS = 86_400_000;

function startOfDay(value: Date) {
  return new Date(value.getFullYear(), value.getMonth(), value.getDate());
}

function addDays(value: Date, days: number) {
  return new Date(value.getFullYear(), value.getMonth(), value.getDate() + days);
}

// Série diária de total acumulado, do primeiro dia da janela até hoje. Com "all", começa no
// primeiro cadastro (mínimo de 2 dias, senão não há linha pra desenhar). Quem entrou antes da
// janela já conta no total do primeiro dia.
export function buildGrowthSeries(users: Pick<User, "createdAt">[], range: GrowthRange, now = new Date()): GrowthPoint[] {
  const today = startOfDay(now);
  const times = users
    .map((u) => new Date(u.createdAt).getTime())
    .filter((t) => !Number.isNaN(t))
    .sort((a, b) => a - b);

  let first: Date;
  if (range === "all") {
    first = times.length > 0 ? startOfDay(new Date(times[0])) : today;
    if (today.getTime() - first.getTime() < DAY_MS) first = addDays(today, -1);
  } else {
    first = addDays(today, -(range - 1));
  }

  const points: GrowthPoint[] = [];
  let cursor = 0;
  for (let day = first; day <= today; day = addDays(day, 1)) {
    const dayStart = day.getTime();
    const dayEnd = addDays(day, 1).getTime();
    let added = 0;
    while (cursor < times.length && times[cursor] < dayEnd) {
      if (times[cursor] >= dayStart) added++;
      cursor++;
    }
    points.push({ date: day, total: cursor, added });
  }
  return points;
}

export function countSince(users: Pick<User, "createdAt">[], days: number, now = new Date()): number {
  const since = addDays(startOfDay(now), -(days - 1)).getTime();
  return users.filter((u) => new Date(u.createdAt).getTime() >= since).length;
}
