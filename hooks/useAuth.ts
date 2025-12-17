"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { getToken, isLoggedIn } from "@/lib/auth";

export type AuthUser = {
  id: string;
  email: string;
  name?: string;
};

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();

    if (!token || !isLoggedIn()) {
      setUser(null);
      setLoading(false);
      return;
    }

    api
      .get("/auth/me")
      .then(res => {
        setUser(res.data.user);
      })
      .catch(() => {
        setUser(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return {
    user,
    isAuthenticated: !!user,
    loading,
  };
}
