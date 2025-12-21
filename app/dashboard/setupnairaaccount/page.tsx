"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import colors from "@/theme/colors";

export default function SetupNairaAccountPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [vaCreated, setVaCreated] = useState(false);
  const [user, setUser] = useState<any>(null);

  // -----------------------
  // Fetch user
  // -----------------------
  const fetchUser = async () => {
    try {
      setLoading(true);
      const res = await api.get("/user/me");
      if (res.data.success) setUser(res.data.user);

      // If VA exists, mark as created
      if (res.data.user.virtualAccount) setVaCreated(true);
    } catch (err) {
      console.error(err);
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
        setVaCreated(true);
        alert("Virtual Naira account created successfully");

        // Refresh user
        await fetchUser();

        // Optional username check
        if (!res.data.user.userID) {
          alert("Please set your username next");
        }
      }
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to create virtual account");
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

      {vaCreated && user?.virtualAccount ? (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow space-y-4">
          <div>
            <span className="text-gray-500 dark:text-gray-400 text-sm">Account Name:</span>
            <p className="font-semibold text-gray-800 dark:text-gray-100">
              {user.virtualAccount.name}
            </p>
          </div>
          <div>
            <span className="text-gray-500 dark:text-gray-400 text-sm">Account Number:</span>
            <p className="font-semibold text-gray-800 dark:text-gray-100">
              {user.virtualAccount.accountNumber}
            </p>
          </div>

          <button
            className="w-full bg-gray-100 dark:bg-gray-700 text-blue-600 dark:text-blue-400 font-semibold py-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
            onClick={() => {
              navigator.clipboard.writeText(user.virtualAccount.accountNumber);
              alert("Account number copied to clipboard");
            }}
          >
            Copy Account Number
          </button>

          {!user.userID && (
            <button
              className="w-full bg-blue-600 text-white font-semibold py-2 rounded hover:bg-blue-700"
              onClick={() => alert("Navigate to Set Username page")}
            >
              Set Username
            </button>
          )}

          <button
            className="w-full mt-2 bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-gray-100 font-semibold py-2 rounded hover:bg-gray-400 dark:hover:bg-gray-500"
            onClick={() => router.push("/dashboard")}
          >
            Back to Dashboard
          </button>
        </div>
      ) : (
        <button
          className="w-full bg-blue-600 text-white font-semibold py-3 rounded hover:bg-blue-700"
          onClick={createVirtualAccount}
        >
          Create Virtual Account
        </button>
      )}
    </div>
  );
}
