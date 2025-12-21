"use client";

import React, { useEffect, useState } from "react";
import ResponsiveLandingWrapper from "@/components/ResponsiveLandingWrapper";
import api from "@/lib/api";

/* ---------------------------------- Types --------------------------------- */
interface VirtualAccount {
  accountNumber: string;
  bankName: string;
  accountName: string;
}

export default function AddMoneyPage() {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [amount, setAmount] = useState("");
  const [balance, setBalance] = useState(0); // NAIRA
  const [va, setVA] = useState<VirtualAccount | null>(null);
  const [step, setStep] = useState<"choose" | "card" | "va">("choose");

  /* --------------------------- Load wallet data ---------------------------- */
  const loadWallet = async () => {
    try {
      setLoading(true);
      const res = await api.get("/wallet");

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

  /* ----------------------------- Card funding ----------------------------- */
  const handleCardFunding = async () => {
    const naira = Number(amount);

    if (!naira || naira < 100) {
      return alert("Minimum funding amount is ₦100");
    }

    try {
      setSubmitting(true);

      /**
       * Backend expects KOBO
       * Frontend sends KOBO
       */
      const res = await api.post("/wallet/fund/card", {
        amount: Math.round(naira * 100),
      });

      if (!res.data?.success) {
        throw new Error(res.data?.message || "Failed to initialize payment");
      }

      // 🔁 Redirect to Paystack
      window.location.href = res.data.data.authorization_url;
    } catch (err: any) {
      console.error("Card funding error:", err);
      alert(err.response?.data?.message || "Payment initialization failed");
    } finally {
      setSubmitting(false);
    }
  };

  /* -------------------------- Virtual Account copy -------------------------- */
  const handleVACopy = () => {
    if (!va) return;

    navigator.clipboard.writeText(
      `Bank: ${va.bankName}\nAccount Number: ${va.accountNumber}\nAccount Name: ${va.accountName}`
    );

    alert(
      "Virtual account details copied.\n\nMake a bank transfer to fund your wallet. Your balance will update automatically."
    );
  };

  /* -------------------------------- Loading -------------------------------- */
  if (loading) {
    return (
      <ResponsiveLandingWrapper>
        <div className="flex justify-center items-center h-64">
          <span className="text-blue-600 text-xl font-semibold">
            Loading…
          </span>
        </div>
      </ResponsiveLandingWrapper>
    );
  }

  /* -------------------------------- Render -------------------------------- */
  return (
    <ResponsiveLandingWrapper>
      <div className="max-w-2xl mx-auto p-6 space-y-6">
        {/* ---------------- Wallet Balance ---------------- */}
        <div className="bg-white p-6 rounded-xl shadow text-center">
          <h2 className="text-xl font-bold text-gray-700">
            Wallet Balance
          </h2>
          <p className="text-3xl font-bold text-gray-900">
            ₦{balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
        </div>

        {/* ---------------- Choose Method ---------------- */}
        {step === "choose" && (
          <div className="bg-white p-6 rounded-xl shadow space-y-4 text-center">
            <h3 className="font-semibold text-gray-700">
              Fund Wallet
            </h3>
            <p className="text-gray-600">
              Choose a funding method
            </p>

            <div className="flex gap-4 justify-center mt-4">
              <button
                onClick={() => setStep("card")}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Card
              </button>

              <button
                onClick={() => setStep("va")}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Bank Transfer
              </button>
            </div>
          </div>
        )}

        {/* ---------------- Card Funding ---------------- */}
        {step === "card" && (
          <div className="bg-white p-6 rounded-xl shadow space-y-3">
            <h3 className="font-semibold text-gray-700">
              Fund via Card
            </h3>

            <input
              type="number"
              placeholder="Enter amount (₦)"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-3"
            />

            <button
              onClick={handleCardFunding}
              disabled={submitting}
              className={`w-full bg-blue-600 text-white font-semibold py-3 rounded-lg ${
                submitting
                  ? "opacity-60 cursor-not-allowed"
                  : "hover:bg-blue-700"
              }`}
            >
              {submitting ? "Redirecting…" : "Pay with Card"}
            </button>

            <button
              onClick={() => setStep("choose")}
              className="w-full mt-2 text-gray-500 hover:underline"
            >
              Back
            </button>
          </div>
        )}

        {/* ---------------- Virtual Account ---------------- */}
        {step === "va" && (
          <div className="bg-white p-6 rounded-xl shadow space-y-3">
            <h3 className="font-semibold text-gray-700">
              Bank Transfer (Virtual Account)
            </h3>

            {va ? (
              <div
                onClick={handleVACopy}
                className="cursor-pointer p-4 border rounded-lg space-y-1 hover:bg-gray-100"
              >
                <p>Bank: <strong>{va.bankName}</strong></p>
                <p>Account No: <strong>{va.accountNumber}</strong></p>
                <p>Account Name: <strong>{va.accountName}</strong></p>
                <p className="text-sm text-gray-500">
                  Tap to copy details
                </p>
              </div>
            ) : (
              <p className="text-red-500">
                You don’t have a virtual account yet.
              </p>
            )}

            <button
              onClick={() => setStep("choose")}
              className="w-full mt-2 text-gray-500 hover:underline"
            >
              Back
            </button>
          </div>
        )}
      </div>
    </ResponsiveLandingWrapper>
  );
}
