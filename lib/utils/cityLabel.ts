import type { City } from "@/types/city";

// O que o seletor precisa saber de uma cidade; City e NearbyCity cabem aqui.
export type CityOption = Pick<City, "id" | "name" | "state" | "parent">;

// "Praia do Rosa, Imbituba - SC" (localidade) ou "Imbituba - SC" (município).
export function cityLabel(city: CityOption): string {
  return city.parent ? `${city.name}, ${city.parent.name} - ${city.state}` : `${city.name} - ${city.state}`;
}
