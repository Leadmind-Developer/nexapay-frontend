"use client";

import React, { useEffect, useState } from "react";
import api from "@/lib/api";
import { useRouter } from "next/navigation";

/* ---------------------------------- Types --------------------------------- */
interface VirtualAccount {
  accountNumber: string;
  bankName: string;
  accountName: string;
}

export default function AddMoneyPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [balance, setBalance] = useState(0); // NAIRA
  const [va, setVA] = useState<VirtualAccount | null>(null);

  /* --------------------------- Load wallet data ---------------------------- */
  const loadWallet = async () => {
    try {
      setLoading(true);
      const res = await api.get("/wallet/me");

      if (!res.data?.success) return;

      setBalance(res.data.wallet.balance); // already NAIRA
      setVA(res.data.virtualAccount || null);
    } catch (err) {
      console.error("Failed to load wallet:", err);
      alert("Failed to load wallet info.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWallet();
  }, []);

  /* -------------------------- Virtual Account copy -------------------------- */
  const handleVACopy = () => {
    if (!va) return;

    navigator.clipboard.writeText(
      `Bank: ${va.bankName}\nAccount Number: ${va.accountNumber}\nAccount Name: ${va.accountName}`
    );

    alert(
      "Virtual account details copied.\n\nMake a bank transfer to fund your wallet."
    );
  };

  /* -------------------------- Confirm transfer -------------------------- */
  const handleConfirmTransfer = async () => {
    const sent = confirm("Have you sent the money to the virtual account?");
    if (sent) {
      await loadWallet(); // refresh balance
      alert("Balance updated!");
      router.push("/dashboard"); // redirect to dashboard
    }
  };

  /* -------------------------------- Loading -------------------------------- */
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <span className="text-blue-600 text-xl font-semibold">Loading…</span>
      </div>
    );
  }

  /* -------------------------------- Render -------------------------------- */
  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      {/* ---------------- Wallet Balance ---------------- */}
      <div className="bg-white p-6 rounded-xl shadow text-center">
        <h2 className="text-xl font-bold text-gray-700">Wallet Balance</h2>
        <p className="text-3xl font-bold text-gray-900">
          ₦{balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </p>
      </div>

      {/* ---------------- Virtual Account Card ---------------- */}
      {va ? (
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-2xl shadow-lg relative">
          <h3 className="font-semibold text-lg mb-4">Virtual Account</h3>

          <div
            onClick={handleVACopy}
            className="cursor-pointer p-5 bg-white bg-opacity-10 rounded-xl space-y-3 hover:bg-opacity-20 transition"
          >
            <p className="text-sm opacity-80">Bank</p>
            <p className="text-lg font-semibold">{va.bankName}</p>

            <p className="text-sm opacity-80">Account Number</p>
            <p className="text-lg font-semibold">{va.accountNumber}</p>

            <p className="text-sm opacity-80">Account Name</p>
            <p className="text-lg font-semibold">{va.accountName}</p>

            <p className="text-xs text-gray-200 mt-2">Tap to copy details</p>
          </div>

          <button
            onClick={handleConfirmTransfer}
            className="w-full mt-4 bg-green-500 hover:bg-green-600 transition font-semibold py-3 rounded-xl shadow-md"
          >
            I have sent the money
          </button>
        </div>
      ) : (
        <p className="text-red-500 text-center">
          You don’t have a virtual account yet. Please create one first.
        </p>
      )}
    </div>
  );
}
