import type { City, CityParent } from "@/types/city";

// Endereço público de uma cidade ou localidade (o mesmo formato pros dois: "/cidades/{slug}").
export function cityPath(city: Pick<City, "slug"> | Pick<CityParent, "slug">): string {
  return `/cidades/${city.slug}`;
}

// Complemento do nome: "SC" pra um município; "Imbituba - SC" pra uma localidade (o título
// já diz "Praia do Rosa", então o complemento diz onde fica).
export function cityPlaceLabel(city: Pick<City, "state" | "parent" | "name">): string {
  return city.parent ? `${city.parent.name} - ${city.state}` : city.state;
}
