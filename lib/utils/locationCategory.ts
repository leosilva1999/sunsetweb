import type { LocationCategory } from "@/types/location";

const LABELS: Record<LocationCategory, string> = {
  Beach: "Praia",
  Viewpoint: "Mirante",
  Mountain: "Montanha",
  Lake: "Lago",
  River: "Rio",
  Urban: "Urbano",
  Other: "Outro",
};

export const LOCATION_CATEGORIES = Object.keys(LABELS) as LocationCategory[];

export function categoryLabel(category: LocationCategory): string {
  return LABELS[category];
}
