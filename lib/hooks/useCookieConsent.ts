"use client";

import { useCallback, useSyncExternalStore } from "react";

export type CookieConsent = "accepted" | "rejected" | null;

const STORAGE_KEY = "sunset-cookie-consent";
const listeners = new Set<() => void>();

function readConsent(): CookieConsent {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored === "accepted" || stored === "rejected" ? stored : null;
}

function writeConsent(consent: CookieConsent) {
  if (consent) {
    localStorage.setItem(STORAGE_KEY, consent);
  } else {
    localStorage.removeItem(STORAGE_KEY);
  }
  listeners.forEach((listener) => listener());
}

function subscribe(callback: () => void) {
  listeners.add(callback);
  window.addEventListener("storage", callback);
  return () => {
    listeners.delete(callback);
    window.removeEventListener("storage", callback);
  };
}

// null no servidor (nunca sabe a preferência antes da hidratação) - evita mismatch de
// hidratação, mesmo motivo do useAuth/useTheme. O banner só decide se aparece depois
// que o client lê o localStorage de verdade.
function getServerSnapshot(): CookieConsent {
  return null;
}

export function useCookieConsent() {
  const consent = useSyncExternalStore(subscribe, readConsent, getServerSnapshot);

  const accept = useCallback(() => writeConsent("accepted"), []);
  const reject = useCallback(() => writeConsent("rejected"), []);

  return { consent, accept, reject };
}
