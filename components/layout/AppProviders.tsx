"use client";

import type { ReactNode } from "react";
import { UploadModalProvider } from "@/lib/hooks/useUploadModal";
import UploadPhotoModal from "@/components/photo/UploadPhotoModal";

export default function AppProviders({ children }: { children: ReactNode }) {
  return (
    <UploadModalProvider>
      {children}
      <UploadPhotoModal />
    </UploadModalProvider>
  );
}
