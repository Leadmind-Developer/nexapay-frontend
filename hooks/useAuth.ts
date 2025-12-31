"use client";

import { useEffect, useState, useCallback } from "react";
import { AuthAPI } from "@/lib/api";

export interface AuthUser {
  id: string;
  email?: string;
  phone?: string;
  name?: string;
}

// Type for verify response
interface VerifyResponse {
  success: boolean;
  user?: AuthUser;
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  // -------------------------------
  // Verify session (HttpOnly cookie)
  // -------------------------------
  const verify = useCallback(async (): Promise<boolean> => {
    try {
      const res = await AuthAPI.verify<VerifyResponse>(); // ✅ typed response
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
  // Cookie-based login (just verify)
  // -------------------------------
  const login = async () => {
    return await verify();
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
    login,   // ✅ no args needed
    logout,
    refresh: verify,
  };
}
