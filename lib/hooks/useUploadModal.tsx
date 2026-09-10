"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

interface UploadModalContextValue {
  isOpen: boolean;
  open: () => void;
  close: () => void;
}

const UploadModalContext = createContext<UploadModalContextValue | null>(null);

export function UploadModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const value = useMemo(() => ({ isOpen, open, close }), [isOpen, open, close]);

  return <UploadModalContext.Provider value={value}>{children}</UploadModalContext.Provider>;
}

export function useUploadModal() {
  const context = useContext(UploadModalContext);
  if (!context) {
    throw new Error("useUploadModal deve ser usado dentro de UploadModalProvider");
  }
  return context;
}
