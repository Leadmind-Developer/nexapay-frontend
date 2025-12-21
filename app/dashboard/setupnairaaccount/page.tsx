"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

export default function SetupNairaAccountPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  // -----------------------
  // Fetch user with VA info
  // -----------------------
  const fetchUser = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get("/user/me");
      if (res.data.success) setUser(res.data.user);

      // If VA exists, redirect automatically
      if (res.data.user?.titanAccountNumber && res.data.user?.titanBankName) {
        router.replace("/dashboard");
      }
    } catch (err) {
      console.error("Failed to fetch user:", err);
      alert("Failed to load user data. Please refresh the page.");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  // -----------------------
  // Create Virtual Account (retry if fails)
  // -----------------------
  const createVirtualAccount = async () => {
    try {
      setLoading(true);

      let attempts = 0;
      let success = false;

      while (!success && attempts < 3) {
        attempts += 1;
        try {
          const res = await api.post("/wallet/provision");
          if (res.data.success) {
            success = true;
            break;
          }
        } catch (err) {
          console.warn(`Attempt ${attempts} failed to create VA`, err);
        }
        await new Promise((r) => setTimeout(r, 1000)); // small delay before retry
      }

      if (!success) throw new Error("Unable to create virtual account. Try again later.");

      // Refresh user data
      await fetchUser();

      alert("Virtual Naira account created successfully. Redirecting to dashboard...");
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Failed to create virtual account");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="loader border-t-4 border-blue-500 w-12 h-12 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-bold mb-2 text-gray-800 dark:text-gray-100">
        Setup Your Naira Account
      </h1>
      <p className="text-gray-600 dark:text-gray-300 mb-6">
        To start using your Nexa wallet, you need a virtual Naira account.
      </p>

      <button
        className="w-full bg-blue-600 text-white font-semibold py-3 rounded hover:bg-blue-700"
        onClick={createVirtualAccount}
      >
        Create Virtual Account
      </button>
    </div>
  );
}
