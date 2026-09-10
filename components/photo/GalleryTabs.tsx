"use client";

import { useState } from "react";
import Tabs from "@/components/ui/Tabs";
import PhotoGrid, { type PhotoGridItem } from "@/components/photo/PhotoGrid";
import { getPhotos } from "@/lib/api/photos";

const RECENT_TAB = "Recentes";
const TOP_TAB = "Mais curtidas";
const NEARBY_TAB = "Perto de mim";
const TABS = [RECENT_TAB, TOP_TAB, NEARBY_TAB];

const TAB_SORT: Record<string, "recent" | "top"> = {
  [RECENT_TAB]: "recent",
  [TOP_TAB]: "top",
};

const GALLERY_LIMIT = 5;

interface GalleryTabsProps {
  initialItems: PhotoGridItem[];
}

export default function GalleryTabs({ initialItems }: GalleryTabsProps) {
  const [active, setActive] = useState(RECENT_TAB);
  const [items, setItems] = useState(initialItems);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = async (tab: string) => {
    const sort = TAB_SORT[tab];
    if (!sort) return;

    setActive(tab);
    setIsLoading(true);
    try {
      const page = await getPhotos(sort, undefined, GALLERY_LIMIT);
      setItems(page.items.map((photo) => ({ photo, locationName: photo.locationName, city: "" })));
    } catch {
      // mantém a lista anterior em caso de falha
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* "Perto de mim" pede filtro geográfico em /photos, que a API ainda não expõe
          (só /locations tem lat+lng+radius) — desabilitado até existir suporte. */}
      <Tabs options={TABS} active={active} onChange={handleChange} disabledOptions={[NEARBY_TAB]} />
      {items.length === 0 ? (
        <p className="text-sm text-cream-dim opacity-70 light:text-ink-dim light:opacity-100">
          {isLoading ? "Carregando..." : "Ainda não há fotos por aqui."}
        </p>
      ) : (
        <PhotoGrid items={items} />
      )}
    </>
  );
}
