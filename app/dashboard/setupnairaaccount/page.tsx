"use client";

import React, { useEffect, useState } from "react";
import api from "@/lib/api";
import { useRouter } from "next/navigation";

interface VirtualAccount {
  accountNumber: string;
  bank?: string;
  accountName?: string;
}

export default function SetupNairaAccountPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  // -----------------------
  // Fetch user
  // -----------------------
  const fetchUser = async () => {
    try {
      setLoading(true);
      const res = await api.get("/user/me");
      if (res.data.success) setUser(res.data.user);
    } catch (err) {
      console.error("Failed to fetch user:", err);
      alert("Failed to load user data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  // -----------------------
  // Create Virtual Account
  // -----------------------
  const createVirtualAccount = async () => {
    try {
      setLoading(true);
      const res = await api.post("/wallet/provision");
      if (res.data.success) {
        alert("Virtual Naira account created successfully!");
        // Refresh user data
        await fetchUser();
        // Auto redirect to dashboard
        router.push("/dashboard");
      } else {
        alert(res.data?.message || "Failed to create virtual account");
      }
    } catch (err: any) {
      console.error("VA creation error:", err);
      alert(err.response?.data?.message || "Failed to create virtual account");
    } finally {
      setLoading(false);
    }
  };

  // -----------------------
  // Copy VA details
  // -----------------------
  const copyVA = () => {
    if (!user?.virtualAccount) return;
    const va: VirtualAccount = user.virtualAccount;
    navigator.clipboard.writeText(
      `Bank: ${va.bank || "N/A"}\nAccount Number: ${va.accountNumber}\nAccount Name: ${va.accountName || "N/A"}`
    );
    alert("Virtual account details copied to clipboard.");
  };

  // -----------------------
  // Loading
  // -----------------------
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="loader border-t-4 border-blue-500 w-12 h-12 rounded-full animate-spin"></div>
      </div>
    );
  }

  // -----------------------
  // Render
  // -----------------------
  return (
    <div className="max-w-md mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold mb-2 text-gray-800 dark:text-gray-100">Setup Your Naira Account</h1>
      <p className="text-gray-600 dark:text-gray-300 mb-6">
        To start using your Nexa wallet, you need a virtual Naira account.
      </p>

      {user?.virtualAccount ? (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow space-y-4">
          <div>
            <span className="text-gray-500 text-sm">Account Name:</span>
            <p className="font-semibold text-gray-800 dark:text-gray-100">
              {user.virtualAccount.accountName || "N/A"}
            </p>
          </div>
          <div>
            <span className="text-gray-500 text-sm">Account Number:</span>
            <p className="font-semibold text-gray-800 dark:text-gray-100">
              {user.virtualAccount.accountNumber}
            </p>
          </div>
          {user.virtualAccount.bank && (
            <div>
              <span className="text-gray-500 text-sm">Bank:</span>
              <p className="font-semibold text-gray-800 dark:text-gray-100">
                {user.virtualAccount.bank}
              </p>
            </div>
          )}

          <button
            className="w-full mt-2 bg-gray-100 dark:bg-gray-700 text-blue-600 dark:text-blue-400 font-semibold py-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition"
            onClick={copyVA}
          >
            Copy Account Details
          </button>

          {!user.userID && (
            <button
              className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded"
              onClick={() => router.push("/dashboard/setusername")}
            >
              Set Username
            </button>
          )}
        </div>
      ) : (
        <button
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition"
          onClick={createVirtualAccount}
        >
          Create Virtual Account
        </button>
      )}
    </div>
  );
}
