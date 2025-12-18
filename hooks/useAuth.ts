"use client";

import { useEffect, useState, useCallback } from "react";
import api from "@/lib/api";
import { TOKEN_KEY } from "@/lib/auth";

export interface AuthUser {
  id: string;
  email?: string;
  phone?: string;
  name?: string;
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const setToken = (token: string | null) => {
    if (!token) localStorage.removeItem(TOKEN_KEY);
    else localStorage.setItem(TOKEN_KEY, token);
  };

  const verify = useCallback(async () => {
    try {
      const res = await api.get("/auth/verify");
      if (res.data?.success) {
        setUser(res.data.user);
        return true;
      }
    } catch {}
    setUser(null);
    setToken(null);
    return false;
  }, []);

  const login = (token: string) => {
    setToken(token);
    verify();
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch {}
    setUser(null);
    setToken(null);
  };

  useEffect(() => {
    verify().finally(() => setLoading(false));
  }, [verify]);

  return {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    logout,
    refresh: verify,
  };
}
