"use client";

import React, { useEffect, useState, useCallback } from "react";
import api from "@/lib/api";
import WalletTransactionItem from "@/components/WalletTransactionItem";

/**
 * Wallet transaction shape used by this page
 */
export interface WalletTransaction {
  id: number;
  type: string;
  amount: number;
  status?: "success" | "pending" | "failed";
  reference?: string;
  createdAt: string;
  description?: string;
  metadata?: any;
}

export default function WalletHistoryPage() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [virtualAccount, setVirtualAccount] = useState<{
    accountNumber: string;
    bankName: string;
    accountName: string;
  } | null>(null);

  const loadWallet = useCallback(async () => {
    try {
      setRefreshing(true);
      const res = await api.get("/wallet");

      setBalance(res.data?.wallet?.balance ?? 0);
      setTransactions(res.data?.wallet?.transactions ?? []);
      setVirtualAccount(res.data?.virtualAccount ?? null);
    } catch (err) {
      console.error("Wallet load error:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadWallet();
  }, [loadWallet]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* HEADER */}
      <header className="bg-[#39358c] text-white py-4 px-6 flex items-center">
        <button
          onClick={() => window.history.back()}
          className="text-lg font-bold"
        >
          ←
        </button>
        <h1 className="flex-1 text-center text-xl font-bold">
          Wallet History
        </h1>
        <div className="w-6" />
      </header>

      <main className="p-6 max-w-2xl mx-auto space-y-6">
        {/* BALANCE */}
        <div className="bg-white p-6 rounded-2xl shadow">
          <p className="text-gray-500 text-sm">Wallet Balance</p>
          <p className="text-3xl font-bold mt-2">
            ₦
            {balance.toLocaleString("en-NG", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>
        </div>

        {/* VIRTUAL ACCOUNT */}
        <div className="bg-white p-6 rounded-2xl shadow">
          <h2 className="text-xl font-bold mb-3">Virtual Account</h2>
          {virtualAccount ? (
            <>
              <p className="text-gray-500 text-xs">Bank</p>
              <p className="font-semibold">{virtualAccount.bankName}</p>

              <p className="text-gray-500 text-xs mt-3">Account Number</p>
              <p className="font-semibold">{virtualAccount.accountNumber}</p>

              <p className="text-gray-500 text-xs mt-3">Account Name</p>
              <p className="font-semibold">{virtualAccount.accountName}</p>
            </>
          ) : (
            <p className="text-gray-400">No virtual account yet.</p>
          )}
        </div>

        {/* TRANSACTIONS */}
        <h2 className="text-xl font-bold">Transaction History</h2>

        {transactions.length > 0 ? (
          <div className="space-y-3">
            {transactions.map((tx) => (
              <WalletTransactionItem key={tx.id} tx={tx} />
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-400 mt-10">
            No transactions yet.
          </p>
        )}

        {/* REFRESH */}
        <button
          onClick={loadWallet}
          disabled={refreshing}
          className="w-full bg-[#39358c] text-white py-3 rounded-xl mt-4 hover:bg-[#2f2b75] disabled:opacity-50"
        >
          {refreshing ? "Refreshing..." : "Refresh Wallet"}
        </button>
      </main>
    </div>
  );
}
