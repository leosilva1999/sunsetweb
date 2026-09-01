"use client";

import { useCallback, useSyncExternalStore } from "react";
import * as authApi from "@/lib/api/auth";
import type { AuthTokens } from "@/lib/api/auth";

const TOKEN_STORAGE_KEY = "sunset_auth_tokens";
const listeners = new Set<() => void>();

function readTokens(): AuthTokens | null {
  const stored = localStorage.getItem(TOKEN_STORAGE_KEY);
  return stored ? (JSON.parse(stored) as AuthTokens) : null;
}

function writeTokens(tokens: AuthTokens | null) {
  if (tokens) {
    localStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(tokens));
  } else {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
  }
  listeners.forEach((listener) => listener());
}

// Sincroniza com o localStorage via useSyncExternalStore (não useState+useEffect)
// para evitar mismatch de hidratação entre servidor e cliente.
function subscribe(callback: () => void) {
  listeners.add(callback);
  window.addEventListener("storage", callback);
  return () => {
    listeners.delete(callback);
    window.removeEventListener("storage", callback);
  };
}

function getServerSnapshot(): AuthTokens | null {
  return null;
}

export function useAuth() {
  const tokens = useSyncExternalStore(subscribe, readTokens, getServerSnapshot);

  const login = useCallback(async (email: string, password: string) => {
    const result = await authApi.login({ email, password });
    writeTokens(result);
    return result;
  }, []);

  const logout = useCallback(async () => {
    if (tokens) {
      await authApi.logout(tokens.access_token).catch(() => {});
    }
    writeTokens(null);
  }, [tokens]);

  return {
    token: tokens?.access_token ?? null,
    isAuthenticated: tokens !== null,
    login,
    logout,
  };
}
