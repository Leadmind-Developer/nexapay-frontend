"use client";

import { useEffect, useState, useCallback } from "react";
import api, { AuthAPI } from "@/lib/api";

export interface AuthUser {
  id: string;
  email?: string;
  phone?: string;
  name?: string;
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  // -------------------------------
  // Verify session
  // -------------------------------
  const verify = useCallback(async () => {
    try {
      const res = await AuthAPI.verify();
      if (res.data?.success && res.data.user) {
        setUser(res.data.user);
        return true;
      }
    } catch (err) {
      console.error("Auth verify failed:", err);
    }
    setUser(null);
    return false;
  }, []);

  // -------------------------------
  // Login (trigger verification)
  // -------------------------------
  const login = async (payload: { identifier: string; password: string }) => {
    try {
      const res = await AuthAPI.login(payload);
      if (res.data?.success) {
        // ✅ Tokens are in HttpOnly cookies, just verify session
        await verify();
      }
      return res.data;
    } catch (err) {
      console.error("Login failed:", err);
      throw err;
    }
  };

  // -------------------------------
  // Logout
  // -------------------------------
  const logout = async () => {
    try {
      await AuthAPI.logout();
    } catch (err) {
      console.error("Logout failed:", err);
    } finally {
      setUser(null);
    }
  };

  // -------------------------------
  // Auto-verify on load
  // -------------------------------
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
