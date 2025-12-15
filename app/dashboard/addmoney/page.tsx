"use client";

import React, { useEffect, useState } from "react";
import ResponsiveLandingWrapper from "@/components/ResponsiveLandingWrapper";
import api from "@/lib/api";
import { useAppStore } from "@/store/useAppStore";

export default function AddMoneyPage() {
  const { startPaymentFlow } = useAppStore();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [amount, setAmount] = useState("");
  const [balance, setBalance] = useState(0);
  const [va, setVA] = useState<{ accountNumber: string; bankName: string; accountName: string } | null>(null);
  const [showSetupPrompt, setShowSetupPrompt] = useState(false);
  const [showDepositConfirm, setShowDepositConfirm] = useState(false);

  const loadWallet = async () => {
    try {
      setLoading(true);
      const res = await api.get("/wallet");
      setBalance(res.data.wallet?.balance || 0);
      setVA(res.data.virtualAccount || null);
      setShowSetupPrompt(!res.data.virtualAccount);
    } catch (err) {
      console.error(err);
      alert("Failed to load wallet info.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWallet();
  }, []);

  const handleTopup = async () => {
    const amt = Number(amount);
    if (!amt || amt < 100) return alert("Enter at least ₦100.");

    setSubmitting(true);
    try {
      await startPaymentFlow({
        amount: amt,
        metadata: { type: "wallet_topup" },
        onServiceExecute: async () => {
          await loadWallet();
          setAmount("");
        },
        forcePaystack: true,
      });
    } catch (err: any) {
      console.error(err);
      alert(err?.message || "Top-up failed.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleVAClick = () => {
    if (!va) return;
    navigator.clipboard.writeText(
      `Bank: ${va.bankName}\nAccount No: ${va.accountNumber}\nAccount Name: ${va.accountName}`
    );
    if (confirm("Account details copied. Have you completed the transfer?")) {
      setShowDepositConfirm(true);
    }
  };

  const confirmVADeposit = async () => {
    setShowDepositConfirm(false);
    try {
      setSubmitting(true);
      await api.post("/wallet/fund/virtual", { amount: Number(amount) || 0 });
      alert("Your VA deposit has been noted.");
      setAmount("");
      await loadWallet();
    } catch (err) {
      console.error(err);
      alert("Failed to record deposit.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <ResponsiveLandingWrapper>
        <div className="flex justify-center items-center h-64">
          <span className="text-blue-600 text-xl font-semibold">Loading...</span>
        </div>
      </ResponsiveLandingWrapper>
    );
  }

  return (
    <ResponsiveLandingWrapper>
      <div className="max-w-2xl mx-auto p-6 space-y-6 relative">
        {/* Wallet Balance */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
          <h2 className="text-xl font-bold text-gray-700 dark:text-gray-100">Wallet Balance</h2>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">₦{balance.toLocaleString()}</p>
        </div>

        {/* Fund via Card */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow space-y-3">
          <h3 className="font-semibold text-gray-700 dark:text-gray-100">Fund via Card</h3>
          <input
            type="number"
            placeholder="Enter amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-900"
          />
          <button
            onClick={handleTopup}
            disabled={submitting}
            className={`w-full bg-blue-600 dark:bg-blue-700 text-white font-semibold py-3 rounded-lg ${
              submitting ? "opacity-60 cursor-not-allowed" : "hover:bg-blue-700 dark:hover:bg-blue-800"
            }`}
          >
            {submitting ? "Processing..." : "Fund Wallet"}
          </button>
        </div>

        {/* Virtual Account */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow space-y-3">
          <h3 className="font-semibold text-gray-700 dark:text-gray-100">Transfer to Virtual Account</h3>
          {va ? (
            <div
              onClick={handleVAClick}
              className="cursor-pointer p-4 border border-gray-200 dark:border-gray-600 rounded-lg space-y-1 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <p className="text-gray-900 dark:text-gray-100">Bank: {va.bankName}</p>
              <p className="text-gray-900 dark:text-gray-100">Account No: {va.accountNumber}</p>
              <p className="text-gray-900 dark:text-gray-100">Account Name: {va.accountName}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Click to copy & confirm deposit</p>
            </div>
          ) : (
            <p className="text-red-500">No virtual account yet — create one to fund your wallet.</p>
          )}
        </div>

        {/* VA Deposit Confirmation */}
        {showDepositConfirm && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl w-80 space-y-4">
              <h4 className="font-bold text-gray-800 dark:text-gray-100 text-lg">Confirm Deposit</h4>
              <p className="text-gray-700 dark:text-gray-300">
                Have you completed the transfer to your virtual account?
              </p>
              <button
                onClick={confirmVADeposit}
                className="w-full bg-blue-600 dark:bg-blue-700 text-white font-semibold py-2 rounded-lg"
              >
                Yes, Confirm
              </button>
              <button
                onClick={() => setShowDepositConfirm(false)}
                className="w-full mt-2 text-gray-500 dark:text-gray-400 hover:underline"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </ResponsiveLandingWrapper>
  );
}
