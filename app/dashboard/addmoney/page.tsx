"use client";

import React, { useEffect, useState } from "react";
import api from "@/lib/api";
import { useRouter } from "next/navigation";

interface VirtualAccount {
  accountNumber: string;
  bankName: string;
  accountName: string;
}

export default function AddMoneyPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [balance, setBalance] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  /* ---------------- Fetch user + wallet ---------------- */
  const fetchUserAndWallet = async () => {
    try {
      if (!refreshing) setLoading(true);

      // Fetch user
      const userRes = await api.get("/user/me");
      if (userRes.data.success) {
        const u = userRes.data.user;

        // Normalize virtual account
        let va: VirtualAccount | null = null;
        if (u.virtualAccount || u.titanAccountNumber) {
          va = {
            accountNumber: u.virtualAccount?.accountNumber || u.titanAccountNumber,
            bankName:
              u.virtualAccount?.bank || u.virtualAccount?.bankName || u.titanBankName || "N/A",
            accountName:
              u.virtualAccount?.name ||
              `${u.firstName || ""} ${u.lastName || ""}`.trim() ||
              "N/A",
          };
        }

        setUser({ ...u, virtualAccount: va });
      }

      // Fetch wallet
      const walletRes = await api.get("/wallet/me");
      if (walletRes.data.success) setBalance(walletRes.data.wallet.balance ?? 0);
    } catch (err) {
      console.error("Failed to load user/wallet:", err);
      alert("Failed to load wallet or user data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchUserAndWallet();
  }, []);

  /* ---------------- Create Virtual Account ---------------- */
  const handleCreateVA = async () => {
    try {
      setLoading(true);
      const res = await api.post("/wallet/provision");
      if (res.data.success) {
        alert("Virtual account created successfully!");
        await fetchUserAndWallet();
      } else {
        alert(res.data?.message || "Failed to create virtual account");
      }
    } catch (err) {
      console.error("VA creation error:", err);
      alert("Failed to create virtual account");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- Copy VA details ---------------- */
  const handleVACopy = () => {
    if (!user?.virtualAccount) return;
    const va = user.virtualAccount;
    navigator.clipboard.writeText(
      `Bank: ${va.bankName}\nAccount Number: ${va.accountNumber}\nAccount Name: ${va.accountName}`
    );
    alert("Virtual account details copied.\n\nMake a bank transfer to fund your wallet.");
  };

  /* ---------------- Confirm transfer ---------------- */
  const handleConfirmTransfer = async () => {
    const sent = confirm("Have you sent the money to the virtual account?");
    if (sent) {
      setRefreshing(true);
      await fetchUserAndWallet();
      alert("Balance updated!");
      router.push("/dashboard");
    }
  };

  /* ---------------- Loading ---------------- */
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <span className="text-blue-500 dark:text-blue-400 text-xl font-semibold">Loading…</span>
      </div>
    );
  }

  /* ---------------- Render ---------------- */
  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      {/* Wallet Balance */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow text-center">
        <h2 className="text-xl font-bold text-gray-700 dark:text-gray-200">Wallet Balance</h2>
        <p className="text-3xl font-bold text-gray-900 dark:text-white">
          ₦{balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </p>
      </div>

      {/* Virtual Account */}
      {user?.virtualAccount ? (
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-2xl shadow-lg relative">
          <h3 className="font-semibold text-lg mb-4">Virtual Account</h3>

          <div
            onClick={handleVACopy}
            className="cursor-pointer p-5 bg-white/20 dark:bg-white/10 rounded-xl space-y-3 hover:bg-white/30 dark:hover:bg-white/20 transition"
          >
            <p className="text-sm opacity-90">Bank</p>
            <p className="text-lg font-semibold">{user.virtualAccount.bankName}</p>

            <p className="text-sm opacity-90">Account Number</p>
            <p className="text-lg font-semibold">{user.virtualAccount.accountNumber}</p>

            <p className="text-sm opacity-90">Account Name</p>
            <p className="text-lg font-semibold">{user.virtualAccount.accountName}</p>

            <p className="text-xs opacity-70 mt-2">Tap to copy details</p>
          </div>

          <button
            onClick={handleConfirmTransfer}
            className="w-full mt-4 bg-green-500 hover:bg-green-600 transition font-semibold py-3 rounded-xl shadow-md"
          >
            I have sent the money
          </button>
        </div>
      ) : (
        <div className="text-center space-y-4">
          <p className="text-red-500">You don’t have a virtual account yet.</p>
          <button
            onClick={handleCreateVA}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl shadow-md"
          >
            Create Virtual Account
          </button>
        </div>
      )}
    </div>
  );
}
