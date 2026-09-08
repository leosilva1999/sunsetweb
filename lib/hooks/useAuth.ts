"use client";

import { useCallback, useSyncExternalStore } from "react";
import * as authApi from "@/lib/api/auth";
import type { AuthResponse } from "@/lib/api/auth";

const AUTH_STORAGE_KEY = "sunset_auth";
const listeners = new Set<() => void>();

// useSyncExternalStore exige que getSnapshot devolva a mesma referência enquanto o
// valor não muda — JSON.parse a cada chamada devolvia um objeto novo sempre,
// o que o React lia como "mudou de novo" a cada render e entrava em loop infinito.
let cachedRaw: string | null = null;
let cachedAuth: AuthResponse | null = null;

function readAuth(): AuthResponse | null {
  const stored = localStorage.getItem(AUTH_STORAGE_KEY);
  if (stored !== cachedRaw) {
    cachedRaw = stored;
    cachedAuth = stored ? (JSON.parse(stored) as AuthResponse) : null;
  }
  return cachedAuth;
}

function writeAuth(auth: AuthResponse | null) {
  if (auth) {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(auth));
  } else {
    localStorage.removeItem(AUTH_STORAGE_KEY);
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

function getServerSnapshot(): AuthResponse | null {
  return null;
}

// Para decisões side-effect (ex.: redirecionar se deslogado) fora do ciclo de
// render — na hidratação, useSyncExternalStore reporta getServerSnapshot (null)
// no primeiro render mesmo pra quem está logado, e um efeito que confiasse nesse
// valor de render redirecionaria usuários autenticados por engano. Isso lê o
// localStorage direto, sempre correto assim que o JS do cliente está rodando.
export function hasStoredAuth(): boolean {
  return readAuth() !== null;
}

// Access token dura só 15min por padrão — qualquer chamada autenticada feita perto
// da expiração (ou depois dela) precisa renovar via refresh token antes. Dedup com
// uma promise compartilhada evita duas renovações simultâneas "gastarem" o mesmo
// refresh token (ele é rotacionado a cada uso, então a segunda falharia).
const EXPIRY_BUFFER_MS = 30_000;
let refreshPromise: Promise<AuthResponse | null> | null = null;

function refreshAuth(current: AuthResponse): Promise<AuthResponse | null> {
  if (!refreshPromise) {
    refreshPromise = authApi
      .refresh(current.refreshToken)
      .then((result) => {
        writeAuth(result);
        return result;
      })
      .catch(() => {
        writeAuth(null);
        return null;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

export function useAuth() {
  const auth = useSyncExternalStore(subscribe, readAuth, getServerSnapshot);

  const login = useCallback(async (email: string, password: string) => {
    const result = await authApi.login({ email, password });
    writeAuth(result);
    return result;
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    const result = await authApi.register({ name, email, password });
    writeAuth(result);
    return result;
  }, []);

  const logout = useCallback(async () => {
    if (auth) {
      await authApi.logout(auth.refreshToken).catch(() => {});
    }
    writeAuth(null);
  }, [auth]);

  // Lê direto do localStorage (não do snapshot do hook) pra não usar um token
  // desatualizado em páginas abertas há muito tempo.
  const getAccessToken = useCallback(async () => {
    const current = readAuth();
    if (!current) return null;

    const expiresInMs = new Date(current.expiresAt).getTime() - Date.now();
    if (expiresInMs > EXPIRY_BUFFER_MS) {
      return current.accessToken;
    }

    const refreshed = await refreshAuth(current);
    return refreshed?.accessToken ?? null;
  }, []);

  const updateProfile = useCallback(
    async (data: { name: string; avatarUrl: string | null }) => {
      const token = await getAccessToken();
      const current = readAuth();
      if (!token || !current) throw new Error("not authenticated");

      const updatedUser = await authApi.updateMe(data, token);
      writeAuth({ ...current, user: updatedUser });
      return updatedUser;
    },
    [getAccessToken],
  );

  return {
    user: auth?.user ?? null,
    token: auth?.accessToken ?? null,
    isAuthenticated: auth !== null,
    login,
    register,
    logout,
    getAccessToken,
    updateProfile,
  };
}
