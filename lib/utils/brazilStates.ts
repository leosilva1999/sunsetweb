export const BRAZIL_STATES = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG", "PA",
  "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO",
] as const;

export function parseBrazilState(value: string | string[] | null | undefined): string | undefined {
  const upper = typeof value === "string" ? value.toUpperCase() : "";
  return (BRAZIL_STATES as readonly string[]).includes(upper) ? upper : undefined;
}
