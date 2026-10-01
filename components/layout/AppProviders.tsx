"use client";

import type { ReactNode } from "react";
import { UploadModalProvider } from "@/lib/hooks/useUploadModal";
import UploadPhotoModal from "@/components/photo/UploadPhotoModal";
import CookieConsentBanner from "@/components/ui/CookieConsentBanner";
import AdSenseScript from "@/components/ads/AdSenseScript";

export default function AppProviders({ children }: { children: ReactNode }) {
  return (
    <UploadModalProvider>
      {children}
      <UploadPhotoModal />
      <CookieConsentBanner />
      <AdSenseScript />
    </UploadModalProvider>
  );
}
