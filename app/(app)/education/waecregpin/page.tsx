"use client";

import React, { useEffect, useState } from "react";
import api from "@/lib/api";
import BannersWrapper from "@/components/BannersWrapper";

/* ================= TYPES ================= */
type Variation = {
  name: string;
  variation_code: string;
  amount: number;
};

type Stage = "form" | "processing" | "success" | "error";

/* ================= PAGE ================= */
export default function WaecRegPinPage() {
  const serviceID = "waec-registration";

  const [variations, setVariations] = useState<Variation[]>([]);
  const [variationCode, setVariationCode] = useState("");
  const [billersCode, setBillersCode] = useState("");
  const [phone, setPhone] = useState("");
  const [amount, setAmount] = useState(0);

  const [stage, setStage] = useState<Stage>("form");
  const [errorMessage, setErrorMessage] = useState("");
  const [reference, setReference] = useState<string | null>(null);

  /* ================= LOAD VARIATIONS ================= */
  useEffect(() => {
    api
      .get(`/vtpass/education/${serviceID}/variations`)
      .then((res) => setVariations(res.data || []))
      .catch(() => setVariations([]));
  }, []);

  /* ================= SET AMOUNT ================= */
  useEffect(() => {
    const selected = variations.find(
      (v) => v.variation_code === variationCode
    );
    setAmount(selected?.amount || 0);
  }, [variationCode, variations]);

  /* ================= CHECKOUT ================= */
  const checkout = async () => {
    if (!variationCode || !billersCode || !phone) return;

    try {
      setStage("processing");
      setErrorMessage("");

      const res = await api.post("/vtpass/education/checkout", {
        serviceID,
        variation_code: variationCode,
        billersCode,
        phone,
        amount, // informational only; backend is authoritative
      });

      setReference(res.data?.requestId || null);
      setStage("success");
    } catch (err: any) {
      setStage("error");
      setErrorMessage(err?.response?.data?.error || "Payment failed");
    }
  };

  /* ================= UI ================= */
  return (
    <BannersWrapper page="education">
      <div className="max-w-md mx-auto px-4 py-8 space-y-4 text-gray-900 dark:text-gray-100">

        {/* ===== FORM ===== */}
        {stage === "form" && (
          <div className="bg-white dark:bg-gray-900 border dark:border-gray-800 rounded-lg p-6 space-y-4 shadow">
            <h2 className="text-xl font-bold">WAEC Registration PIN</h2>

            {/* PIN TYPE */}
            <select
              value={variationCode}
              onChange={(e) => setVariationCode(e.target.value)}
              className="w-full p-3 border rounded dark:bg-gray-900 dark:border-gray-700"
            >
              <option value="">Select Registration Type</option>
              {variations.map((v) => (
                <option key={v.variation_code} value={v.variation_code}>
                  {v.name} — ₦{Number(v.amount).toLocaleString()}
                </option>
              ))}
            </select>

            {/* CANDIDATE NUMBER */}
            <input
              value={billersCode}
              onChange={(e) => setBillersCode(e.target.value)}
              placeholder="Candidate Number / Name"
              className="w-full p-3 border rounded dark:bg-gray-900 dark:border-gray-700"
            />

            {/* PHONE */}
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Phone Number"
              className="w-full p-3 border rounded dark:bg-gray-900 dark:border-gray-700"
            />

            {/* AMOUNT */}
            <p className="text-sm text-gray-500">
              Amount: <b>₦{amount ? amount.toLocaleString() : "--"}</b>
            </p>

            <button
              onClick={checkout}
              disabled={!variationCode || !billersCode || !phone}
              className="w-full bg-blue-600 text-white py-3 rounded font-semibold disabled:opacity-60"
            >
              Pay Now
            </button>
          </div>
        )}

        {/* ===== PROCESSING ===== */}
        {stage === "processing" && (
          <div className="bg-white dark:bg-gray-900 border rounded p-6 text-center">
            Processing payment…
          </div>
        )}

        {/* ===== SUCCESS ===== */}
        {stage === "success" && (
          <div className="bg-green-100 dark:bg-green-900 border p-6 rounded text-center space-y-3">
            <h2 className="text-xl font-bold">Purchase Successful 🎉</h2>

            {reference && (
              <p className="text-xs break-all">
                <b>Reference:</b> {reference}
              </p>
            )}

            <p className="text-sm opacity-80">
              Your WAEC Registration PIN will appear in Transactions shortly.
            </p>
          </div>
        )}

        {/* ===== ERROR ===== */}
        {stage === "error" && (
          <div className="bg-red-100 dark:bg-red-900 border p-6 rounded text-center space-y-3">
            <h2 className="text-lg font-bold">Purchase Failed</h2>
            <p className="text-sm">{errorMessage}</p>
            <button
              onClick={() => setStage("form")}
              className="w-full bg-blue-600 text-white py-3 rounded"
            >
              Try Again
            </button>
          </div>
        )}

      </div>
    </BannersWrapper>
  );
}
