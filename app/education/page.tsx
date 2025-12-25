"use client";

import React, { useEffect, useState } from "react";
import api from "@/lib/api";
import ResponsiveLandingWrapper from "@/components/ResponsiveLandingWrapper";
import BannersWrapper from "@/components/BannersWrapper";
import { useCheckout } from "@/hooks/useCheckout";

/* ================= TYPES ================= */
type Variation = {
  name: string;
  variation_code: string;
  amount: number;
};

type Stage = "form" | "verifying";

/* ================= SERVICES ================= */
const SERVICES = [
  { id: "waec", label: "WAEC" },
  { id: "jamb", label: "JAMB" },
  { id: "neco", label: "NECO" },
  { id: "nabteb", label: "NABTEB" },
];

/* ================= PAGE ================= */
export default function EducationPage() {
  const [serviceID, setServiceID] = useState("");
  const [variationCode, setVariationCode] = useState("");
  const [billersCode, setBillersCode] = useState("");
  const [phone, setPhone] = useState("");

  const [variations, setVariations] = useState<Variation[]>([]);
  const [amount, setAmount] = useState(0);
  const [stage, setStage] = useState<Stage>("form");

  const {
    stage: checkoutStage,
    errorMessage,
    reference,
    checkout,
  } = useCheckout();

  /* ================= LOAD VARIATIONS ================= */
  useEffect(() => {
    if (!serviceID) {
      setVariations([]);
      setVariationCode("");
      return;
    }

    api
      .get(`/vtpass/education/variations?serviceID=${serviceID}`)
      .then(res => setVariations(res.data || []))
      .catch(() => setVariations([]));
  }, [serviceID]);

  /* ================= SET AMOUNT ================= */
  useEffect(() => {
    const selected = variations.find(v => v.variation_code === variationCode);
    setAmount(selected?.amount || 0);
  }, [variationCode, variations]);

  /* ================= VERIFY CANDIDATE ================= */
  const verifyCandidate = async () => {
    if (!serviceID || !variationCode || !billersCode) return;

    try {
      setStage("verifying");

      const res = await api.post("/vtpass/education/verify", {
        serviceID,
        variation_code: variationCode,
        billersCode,
      });

      if (res.data?.status === "success") {
        handleCheckout();
      } else {
        setStage("form");
      }
    } catch {
      setStage("form");
    }
  };

  /* ================= CHECKOUT ================= */
  const handleCheckout = () => {
    checkout({
      endpoint: "/vtpass/education/checkout",
      payload: {
        serviceID,
        variation_code: variationCode,
        billersCode,
        amount,
        phone,
      },
    });
  };

  /* ================= UI ================= */
  return (
    <ResponsiveLandingWrapper>
      <BannersWrapper page="education">
        <div className="max-w-md mx-auto px-4 space-y-4 text-gray-900 dark:text-gray-100">

          {/* ===== FORM ===== */}
          {checkoutStage === "idle" && stage === "form" && (
            <div className="bg-white dark:bg-gray-900 border dark:border-gray-800 rounded-lg p-6 space-y-4 shadow">
              <h2 className="text-xl font-bold">Education PIN Purchase</h2>

              <select
                value={serviceID}
                onChange={e => {
                  setServiceID(e.target.value);
                  setVariationCode("");
                }}
                className="w-full p-3 border rounded dark:bg-gray-900 dark:border-gray-700"
              >
                <option value="">Select Exam</option>
                {SERVICES.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>

              {variations.length > 0 && (
                <select
                  value={variationCode}
                  onChange={e => setVariationCode(e.target.value)}
                  className="w-full p-3 border rounded dark:bg-gray-900 dark:border-gray-700"
                >
                  <option value="">Select PIN Type</option>
                  {variations.map(v => (
                    <option key={v.variation_code} value={v.variation_code}>
                      {v.name} — ₦{v.amount}
                    </option>
                  ))}
                </select>
              )}

              <input
                value={billersCode}
                onChange={e => setBillersCode(e.target.value)}
                placeholder="Candidate / Registration Number"
                className="w-full p-3 border rounded dark:bg-gray-900 dark:border-gray-700"
              />

              <input
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="Phone (optional)"
                className="w-full p-3 border rounded dark:bg-gray-900 dark:border-gray-700"
              />

              <p className="text-sm text-gray-500">
                Amount: <b>₦{amount || "--"}</b>
              </p>

              <button
                onClick={verifyCandidate}
                disabled={!amount}
                className="w-full bg-blue-600 text-white py-3 rounded font-semibold disabled:opacity-60"
              >
                Verify & Pay
              </button>
            </div>
          )}

          {/* ===== VERIFYING ===== */}
          {stage === "verifying" && (
            <div className="bg-white dark:bg-gray-900 border dark:border-gray-800 rounded-lg p-6 text-center shadow">
              Verifying candidate details…
            </div>
          )}

          {/* ===== PROCESSING ===== */}
          {checkoutStage === "processing" && (
            <div className="bg-white dark:bg-gray-900 border dark:border-gray-800 rounded-lg p-6 text-center shadow">
              Processing payment…
            </div>
          )}

          {/* ===== SUCCESS ===== */}
          {checkoutStage === "success" && (
            <div className="bg-green-100 dark:bg-green-900 border dark:border-green-800 p-6 rounded text-center space-y-3">
              <h2 className="text-xl font-bold">Purchase Successful 🎉</h2>

              {reference && (
                <p className="text-xs break-all">
                  <b>Reference:</b> {reference}
                </p>
              )}

              <p className="text-sm opacity-80">
                Your PIN will appear in Transactions shortly.
              </p>
            </div>
          )}

          {/* ===== ERROR ===== */}
          {checkoutStage === "error" && (
            <div className="bg-red-100 dark:bg-red-900 border dark:border-red-800 p-6 rounded text-center space-y-3">
              <h2 className="text-lg font-bold">Purchase Failed</h2>
              <p className="text-sm">{errorMessage}</p>
              <a
                href="/contact"
                className="inline-block bg-blue-600 text-white py-3 px-4 rounded w-full"
              >
                Contact Support
              </a>
            </div>
          )}

        </div>
      </BannersWrapper>
    </ResponsiveLandingWrapper>
  );
}
