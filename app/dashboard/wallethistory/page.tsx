"use client";

import React, { useEffect, useState, useCallback } from "react";
import api from "@/lib/api";
import WalletTransactionItem, { WalletTransaction } from "@/components/WalletTransactionItem";

export interface WalletTransaction {
  id: number;
  type: string;
  amount: number;
  date: string;
  description: string;
}

export default function WalletHistoryPage() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [balance, setBalance] = useState(0);
  const [txs, setTxs] = useState<WalletTransaction[]>([]);
  const [va, setVa] = useState<{ accountNumber: string; bankName: string; accountName: string } | null>(null);

  const loadWallet = useCallback(async () => {
    try {
      setRefreshing(true);
      const res = await api.get("/wallet");
      setBalance(res.data.wallet.balance || 0);
      setTxs(res.data.wallet.transactions || []);
      setVa(res.data.virtualAccount || null);
    } catch (err) {
      console.log("Wallet load error:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadWallet();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* HEADER */}
      <div className="bg-[#39358c] text-white py-4 px-6 flex items-center justify-between">
        <button onClick={() => window.history.back()} className="font-bold text-lg">←</button>
        <h1 className="text-center text-xl font-bold flex-1">Wallet History</h1>
        <div style={{ width: 24 }} /> {/* placeholder */}
      </div>

      <div className="p-6 max-w-2xl mx-auto space-y-6">
        {/* WALLET BALANCE */}
        <div className="bg-white p-6 rounded-2xl shadow">
          <div className="text-gray-500 text-sm">Wallet Balance</div>
          <div className="text-3xl font-bold mt-2">
            ₦{balance.toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>

        {/* VIRTUAL ACCOUNT */}
        <div className="bg-white p-6 rounded-2xl shadow">
          <h2 className="text-xl font-bold mb-4">Virtual Account</h2>
          {va ? (
            <>
              <div className="text-gray-500 text-xs">Bank Name</div>
              <div className="font-semibold text-lg">{va.bankName}</div>

              <div className="text-gray-500 text-xs mt-3">Account Number</div>
              <div className="font-semibold text-lg">{va.accountNumber}</div>

              <div className="text-gray-500 text-xs mt-3">Account Name</div>
              <div className="font-semibold text-lg">{va.accountName}</div>
            </>
          ) : (
            <div className="text-gray-400 mt-2">No virtual account yet.</div>
          )}
        </div>

        {/* TRANSACTIONS */}
        <h2 className="text-xl font-bold">Transaction History</h2>

        {txs.length > 0 ? (
          <div className="space-y-4">
            {txs.map((tx) => (
              <div key={tx.id} className="bg-white p-4 rounded-xl shadow flex justify-between items-center">
                <div>
                  <div className="font-semibold">{tx.type}</div>
                  <div className="text-gray-500 text-sm">{tx.description}</div>
                  <div className="text-gray-400 text-xs">{new Date(tx.date).toLocaleString()}</div>
                </div>
                <div className={`font-bold ${tx.amount >= 0 ? "text-green-600" : "text-red-600"}`}>
                  {tx.amount >= 0 ? "+" : "-"}₦{Math.abs(tx.amount).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-400 mt-10">No transactions yet.</div>
        )}

        {/* REFRESH BUTTON */}
        <button
          onClick={loadWallet}
          disabled={refreshing}
          className="w-full bg-[#39358c] text-white py-3 rounded-xl mt-4 hover:bg-[#2f2b75] disabled:opacity-50"
        >
          {refreshing ? "Refreshing..." : "Refresh Wallet"}
        </button>
      </div>
    </div>
  );
}
