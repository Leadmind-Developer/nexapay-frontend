"use client";

import React, { useEffect, useState } from "react";
import api from "@/lib/api";
import colors from "@/theme/colors";

export default function SetupNairaAccountPage() {
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

        // Check username
        if (!res.data.user.userID) {
          alert("Please set your username next");
        } else {
          alert("Account ready. Redirecting to Home...");
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
      <h1 className="text-2xl font-bold mb-2 text-gray-800">Setup Your Naira Account</h1>
      <p className="text-gray-600 mb-6">
        To start using your Nexa wallet, you need a virtual Naira account.
      </p>

      {user?.virtualAccount ? (
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="mb-3">
            <span className="text-gray-500 text-sm">Account Name:</span>
            <p className="font-semibold text-gray-800">{user.virtualAccount.name}</p>
          </div>
          <div className="mb-3">
            <span className="text-gray-500 text-sm">Account Number:</span>
            <p className="font-semibold text-gray-800">{user.virtualAccount.accountNumber}</p>
          </div>

          <button
            className="mt-4 w-full bg-gray-100 text-blue-600 font-semibold py-2 rounded hover:bg-gray-200"
            onClick={() => {
              navigator.clipboard.writeText(user.virtualAccount.accountNumber);
              alert("Account number copied to clipboard");
            }}
          >
            Copy Account Number
          </button>

          {!user.userID && (
            <button
              className="mt-4 w-full bg-blue-600 text-white font-semibold py-2 rounded hover:bg-blue-700"
              onClick={() => alert("Navigate to Set Username page")}
            >
              Set Username
            </button>
          )}
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
