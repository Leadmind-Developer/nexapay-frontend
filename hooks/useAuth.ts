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

  if (!token) {
    setUser(null);
    setLoading(false);
    return;
  }

  api
    .get("/auth/verify", {
      headers: { "x-platform": "web" },
    })
    .then(res => {
      if (res.data?.success && res.data.user) {
        setUser(res.data.user);
      } else {
        setUser(null);
      }
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
