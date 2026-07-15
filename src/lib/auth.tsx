import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";

import { AUTH_CONFIG } from "./auth-config";
import { loginRequest, type AuthUser } from "./auth-api";

interface AuthCtx {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  /** True sampai state dari localStorage selesai dibaca (menghindari flash saat SSR/hydrate). */
  hydrated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const Ctx = createContext<AuthCtx | null>(null);

function readStored(): { token: string | null; user: AuthUser | null } {
  if (typeof window === "undefined") return { token: null, user: null };
  try {
    const token = window.localStorage.getItem(AUTH_CONFIG.tokenStorageKey);
    const rawUser = window.localStorage.getItem(AUTH_CONFIG.userStorageKey);
    return { token, user: rawUser ? (JSON.parse(rawUser) as AuthUser) : null };
  } catch {
    return { token: null, user: null };
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [hydrated, setHydrated] = useState(false);

  // Baca sesi tersimpan hanya di klien, setelah mount.
  useEffect(() => {
    const stored = readStored();
    setToken(stored.token);
    setUser(stored.user);
    setHydrated(true);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const result = await loginRequest(email, password);
    setToken(result.token);
    setUser(result.user);
    try {
      window.localStorage.setItem(AUTH_CONFIG.tokenStorageKey, result.token);
      window.localStorage.setItem(AUTH_CONFIG.userStorageKey, JSON.stringify(result.user));
    } catch {
      // Storage tidak tersedia (mis. mode privat) — sesi tetap jalan di memori.
    }
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    try {
      window.localStorage.removeItem(AUTH_CONFIG.tokenStorageKey);
      window.localStorage.removeItem(AUTH_CONFIG.userStorageKey);
    } catch {
      // abaikan
    }
  }, []);

  const value: AuthCtx = {
    user,
    token,
    isAuthenticated: Boolean(token),
    hydrated,
    login,
    logout,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAuth dipakai di luar AuthProvider");
  return v;
}

/**
 * Proteksi route sisi-klien: bila belum login, arahkan ke /login.
 * Selama belum ter-hydrate, tampilkan placeholder agar tidak ada kedip konten.
 */
export function RequireAuth({ children }: { children: ReactNode }) {
  const { isAuthenticated, hydrated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (hydrated && !isAuthenticated) {
      navigate({ to: "/login", replace: true });
    }
  }, [hydrated, isAuthenticated, navigate]);

  if (!hydrated || !isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-[10px] font-mono uppercase tracking-[0.25em] text-muted-foreground">
          Memuat sesi…
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
