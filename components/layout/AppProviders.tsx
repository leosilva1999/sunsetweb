"use client";

import type { ReactNode } from "react";
import { UploadModalProvider } from "@/lib/hooks/useUploadModal";
import UploadPhotoModal from "@/components/photo/UploadPhotoModal";
import CookieConsentBanner from "@/components/ui/CookieConsentBanner";
import LegalAcceptanceGate from "@/components/layout/LegalAcceptanceGate";
import AdSenseScript from "@/components/ads/AdSenseScript";

export default function AppProviders({ children }: { children: ReactNode }) {
  return (
    <UploadModalProvider>
      {children}
      <UploadPhotoModal />
      <LegalAcceptanceGate />
      <CookieConsentBanner />
      <AdSenseScript />
    </UploadModalProvider>
  );
}
