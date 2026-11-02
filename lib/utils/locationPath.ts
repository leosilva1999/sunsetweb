import type { Location } from "@/types/location";

// Endereço público de um local: pelo slug (imutável, ex.: "praia-do-rosa-imbituba-sc").
// O GUID também abre a página, mas só pra redirecionar pro slug.
export function locationPath(location: Pick<Location, "slug">): string {
  return `/locations/${location.slug}`;
}
