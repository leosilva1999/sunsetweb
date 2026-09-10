"use client";

import { useRouter, useSearchParams } from "next/navigation";
import Tabs from "@/components/ui/Tabs";

const PERIOD_OPTIONS: { label: string; value: "week" | "month" | "all" }[] = [
  { label: "Semana", value: "week" },
  { label: "Mês", value: "month" },
  { label: "Sempre", value: "all" },
];

export default function RankingPeriodTabs() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const rawPeriod = searchParams.get("period");
  const activeValue = rawPeriod === "month" || rawPeriod === "all" ? rawPeriod : "week";
  const activeLabel = PERIOD_OPTIONS.find((option) => option.value === activeValue)!.label;

  const handleChange = (label: string) => {
    const option = PERIOD_OPTIONS.find((o) => o.label === label);
    if (!option) return;
    router.push(`/ranking?period=${option.value}`);
  };

  return <Tabs options={PERIOD_OPTIONS.map((option) => option.label)} active={activeLabel} onChange={handleChange} />;
}
