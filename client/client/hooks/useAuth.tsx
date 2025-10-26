import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { AuthLoginRequest, AuthResponse, AuthSignupRequest, User } from "@shared/api";

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  signup: (payload: AuthSignupRequest) => Promise<void>;
  login: (payload: AuthLoginRequest) => Promise<void>;
  logout: () => void;
  authFetch: (input: RequestInfo, init?: RequestInit) => Promise<Response>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = localStorage.getItem("auth_token");
    const u = localStorage.getItem("auth_user");
    if (t && u) {
      setToken(t);
      try {
        setUser(JSON.parse(u));
      } catch {}
    }
    setLoading(false);
  }, []);

  const saveAuth = useCallback((resp: AuthResponse) => {
    setUser(resp.user);
    setToken(resp.token);
    localStorage.setItem("auth_token", resp.token);
    localStorage.setItem("auth_user", JSON.stringify(resp.user));
  }, []);

  const signup = useCallback(async (payload: AuthSignupRequest) => {
    const r = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    // read body once
    let body: any = null;
    try {
      body = await r.json();
    } catch (e) {
      // ignore JSON parse errors
    }
    if (!r.ok) throw new Error((body && body.error) || "Signup failed");
    saveAuth(body as AuthResponse);
  }, [saveAuth]);

  const login = useCallback(async (payload: AuthLoginRequest) => {
    const r = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    let body: any = null;
    try {
      body = await r.json();
    } catch (e) {}
    if (!r.ok) throw new Error((body && body.error) || "Login failed");
    saveAuth(body as AuthResponse);
  }, [saveAuth]);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
  }, []);

  const authFetch = useCallback(
    (input: RequestInfo, init?: RequestInit) => {
      const headers: Record<string, string> = { ...(init?.headers as any) };
      if (token) headers["Authorization"] = `Bearer ${token}`;
      return fetch(input, { ...init, headers });
    },
    [token],
  );

  const value = useMemo(
    () => ({ user, token, loading, signup, login, logout, authFetch }),
    [user, token, loading, signup, login, logout, authFetch],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
