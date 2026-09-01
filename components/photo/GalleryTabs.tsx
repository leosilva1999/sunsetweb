"use client";

import { useState } from "react";
import Tabs from "@/components/ui/Tabs";
import PhotoGrid, { type PhotoGridItem } from "@/components/photo/PhotoGrid";

interface GalleryTabsProps {
  tabs: string[];
  items: PhotoGridItem[];
}

export default function GalleryTabs({ tabs, items }: GalleryTabsProps) {
  const [active, setActive] = useState(tabs[0]);

  return (
    <>
      <Tabs options={tabs} active={active} onChange={setActive} />
      <PhotoGrid items={items} />
    </>
  );
}
