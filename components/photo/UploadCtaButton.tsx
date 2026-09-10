"use client";

import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";
import { useUploadModal } from "@/lib/hooks/useUploadModal";

export default function UploadCtaButton({ className }: { className?: string }) {
  const { isAuthenticated } = useAuth();
  const { open: openUploadModal } = useUploadModal();
  const router = useRouter();
  const pathname = usePathname();

  const handleClick = () => {
    if (isAuthenticated) {
      openUploadModal();
    } else {
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
    }
  };

  return (
    <button onClick={handleClick} className={className}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="text-ink light:text-paper">
        <path d="M12 19V5M5 12l7-7 7 7" />
      </svg>
      Postar foto
    </button>
  );
}
