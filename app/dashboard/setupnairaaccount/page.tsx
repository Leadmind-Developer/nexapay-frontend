"use client";

import React, { useEffect, useState } from "react";
import api from "@/lib/api";
import { useRouter } from "next/navigation";

interface VirtualAccount {
  accountNumber: string;
  bankName?: string;
  accountName?: string;
}

interface User {
  firstName?: string;
  lastName?: string;
  userID?: string;
  virtualAccount?: VirtualAccount | null;
}

export default function SetupNairaAccountPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);

  /* ---------------- FETCH USER ---------------- */
  const fetchUser = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await api.get("/user/me");
      if (res.data?.success) {
        setUser(res.data.user);
      } else {
        throw new Error("Failed to load user");
      }
    } catch (err) {
      console.error("Fetch user error:", err);
      setError("Failed to load account information");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  /* ---------------- CREATE VIRTUAL ACCOUNT ---------------- */
  const createVirtualAccount = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await api.post("/wallet/provision");
      if (!res.data?.success) {
        throw new Error(res.data?.message || "Provision failed");
      }

      await fetchUser();
      router.push("/dashboard");
    } catch (err: any) {
      console.error("VA creation error:", err);
      setError(err.response?.data?.message || "Failed to create virtual account");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- COPY DETAILS ---------------- */
  const copyVA = () => {
    if (!user?.virtualAccount) return;

    const va = user.virtualAccount;
    const accountName =
      va.accountName ||
      `${user.firstName || ""} ${user.lastName || ""}`.trim();

    navigator.clipboard.writeText(
      `Bank: ${va.bankName}\nAccount Number: ${va.accountNumber}\nAccount Name: ${accountName}`
    );

    alert("Account details copied");
  };

  /* ---------------- LOADING ---------------- */
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-10 h-10 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  const hasVA = Boolean(user?.virtualAccount?.accountNumber);

  const resolvedAccountName =
    user?.virtualAccount?.accountName ||
    `${user?.firstName || ""} ${user?.lastName || ""}`.trim();

  /* ---------------- RENDER ---------------- */
  return (
    <div className="max-w-md mx-auto p-6 space-y-6">
      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          {hasVA ? "Your Naira Account" : "Set Up Your Naira Account"}
        </h1>

        <p className="text-gray-600 dark:text-gray-300 mt-1">
          {hasVA
            ? "Use the details below to fund your Nexa wallet."
            : "Create a virtual Naira account to start using your Nexa wallet."}
        </p>
      </div>

      {/* ERROR */}
      {error && (
        <div className="bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 p-3 rounded">
          {error}
        </div>
      )}

      {/* VIRTUAL ACCOUNT EXISTS */}
      {hasVA && user?.virtualAccount ? (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow space-y-4">
          <div>
            <p className="text-sm text-gray-500">Account Name</p>
            <p className="font-semibold text-gray-900 dark:text-gray-100">
              {resolvedAccountName}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Account Number</p>
            <p className="font-semibold text-gray-900 dark:text-gray-100">
              {user.virtualAccount.accountNumber}
            </p>
          </div>

          {user.virtualAccount.bankName && (
            <div>
              <p className="text-sm text-gray-500">Bank</p>
              <p className="font-semibold text-gray-900 dark:text-gray-100">
                {user.virtualAccount.bankName}
              </p>
            </div>
          )}

          <button
            onClick={copyVA}
            className="w-full mt-3 bg-gray-100 dark:bg-gray-700 text-blue-600 dark:text-blue-400 font-semibold py-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition"
          >
            Copy Account Details
          </button>

          {!user.userID && (
            <button
              onClick={() => router.push("/dashboard/setusername")}
              className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded"
            >
              Set Username
            </button>
          )}
        </div>
      ) : (
        /* NO VIRTUAL ACCOUNT */
        <button
          onClick={createVirtualAccount}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition"
        >
          Create Virtual Account
        </button>
      )}
    </div>
  );
}
