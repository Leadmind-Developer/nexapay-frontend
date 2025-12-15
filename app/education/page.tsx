"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import api from "@/lib/api";
import ResponsiveLandingWrapper from "@/components/ResponsiveLandingWrapper";
import BannersWrapper from "@/components/BannersWrapper";


export default function EducationPage() {
  const [serviceID, setServiceID] = useState("");
  const [variationCode, setVariationCode] = useState("");
  const [billersCode, setBillersCode] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [stage, setStage] = useState<"form" | "verifying" | "paying" | "success">("form");
  const [receipt, setReceipt] = useState<any>(null);
  const [variations, setVariations] = useState<{ name: string; variation_code: string; amount: number }[]>([]);
  const [selectedAmount, setSelectedAmount] = useState<number>(0);

  const SERVICES = [
    { id: "waec", label: "WAEC" },
    { id: "jamb", label: "JAMB" },
    { id: "neco", label: "NECO" },
    { id: "nabteb", label: "NABTEB" },
  ];

  // Wizard steps
  const steps = ["Details", "Verify", "Payment", "Complete"];
  const stageIndex = ["form", "verifying", "paying", "success"].indexOf(stage);

  // Fetch variations
  useEffect(() => {
    if (!serviceID) return setVariations([]);
    api
      .get(`/vtpass/education/variations?serviceID=${serviceID}`)
      .then((res) => setVariations(res.data))
      .catch(() => alert("Failed to load variations"));
  }, [serviceID]);

  // Update amount
  useEffect(() => {
    const selected = variations.find(v => v.variation_code === variationCode);
    setSelectedAmount(selected ? selected.amount : 0);
  }, [variationCode, variations]);

  async function verifyCandidate() {
    if (!serviceID || !variationCode || !billersCode)
      return alert("Fill all required fields");

    try {
      setStage("verifying");
      const res = await api.post("/vtpass/education/verify", {
        serviceID,
        variation_code: variationCode,
        billersCode,
      });

      if (res.data?.status === "success") startPayment();
      else {
        alert(res.data?.message || "Verification failed");
        setStage("form");
      }
    } catch {
      alert("Verification failed");
      setStage("form");
    }
  }

  async function startPayment() {
    try {
      setLoading(true);
      const reference = `EDU-${Date.now()}`;

      const initRes = await api.post("/paystack/initialize", {
        email: "guest@nexa-pay.app",
        amount: selectedAmount * 100,
        reference,
        metadata: {
          purpose: "education_purchase",
          serviceID,
          billersCode,
          variationCode,
          phone,
        },
        callback_url: `${window.location.origin}/education?ref=${reference}`,
      });

      window.location.href = initRes.data.data.authorization_url;
    } catch {
      alert("Payment init failed");
    } finally {
      setLoading(false);
    }
  }

  async function verifyAndPurchase(reference: string) {
    try {
      setStage("paying");
      const verify = await api.get(`/paystack/verify/${reference}`);

      if (verify.data.status !== "success") {
        alert("Payment not completed");
        setStage("form");
        return;
      }

      const buy = await api.post("/vtpass/education/purchase", {
        request_id: reference,
        serviceID,
        billersCode,
        variation_code: variationCode,
        phone,
      });

      setReceipt({
        reference,
        serviceID,
        billersCode,
        variationCode,
        amount: selectedAmount,
        vtpass: buy.data,
      });

      setStage("success");
    } catch {
      alert("Education purchase failed");
      setStage("form");
    }
  }

  useEffect(() => {
    const ref = new URL(window.location.href).searchParams.get("ref");
    if (ref) verifyAndPurchase(ref);
  }, []);

  return (
  <ResponsiveLandingWrapper>
    <BannersWrapper page="education">
      <div className="max-w-md mx-auto px-4">

        {/* 🔹 Animated Step Wizard */}
        <div className="flex items-center justify-between mb-8 relative">
          {steps.map((_, idx) => {
            const active = idx <= stageIndex;

            return (
              <div key={idx} className="flex-1 flex items-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className={`w-10 h-10 rounded-full flex items-center justify-center z-10 border-2
                    ${active
                      ? "bg-blue-600 border-blue-600 text-white"
                      : "border-gray-300 bg-white text-gray-400"
                    }`}
                >
                  {idx + 1}
                </motion.div>

                {idx < steps.length - 1 && (
                  <motion.div
                    className="flex-1 h-1 -ml-1 rounded"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: idx < stageIndex ? 1 : 0 }}
                    transition={{ duration: 0.4 }}
                    style={{
                      transformOrigin: "left",
                      backgroundColor: idx < stageIndex ? "#2563EB" : "#D1D5DB",
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* 🔹 Step Content */}
        {stage === "form" && (
          <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 space-y-4 transition-colors">
            <h1 className="text-xl font-bold">Education PIN Purchase</h1>

            <select
              value={serviceID}
              onChange={(e) => {
                setServiceID(e.target.value);
                setVariationCode("");
              }}
              className="w-full p-3 border rounded"
            >
              <option value="">Select Service</option>
              {SERVICES.map(s => (
                <option key={s.id} value={s.id}>{s.label}</option>
              ))}
            </select>

            <select
              value={variationCode}
              onChange={(e) => setVariationCode(e.target.value)}
              className="w-full p-3 border rounded"
            >
              <option value="">Select Variation</option>
              {variations.map(v => (
                <option key={v.variation_code} value={v.variation_code}>
                  {v.name} — ₦{v.amount}
                </option>
              ))}
            </select>

            <input
              value={billersCode}
              onChange={(e) => setBillersCode(e.target.value)}
              placeholder="Candidate / Registration Number"
              className="w-full p-3 border rounded"
            />

            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Phone (optional)"
              className="w-full p-3 border rounded"
            />

            <p className="text-gray-600">Amount: ₦{selectedAmount}</p>

            <button
              onClick={verifyCandidate}
              disabled={!selectedAmount || loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded transition-colors"
            >
              Verify & Pay
            </button>
          </div>
        )}

        {(stage === "verifying" || stage === "paying") && (
          <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 text-center transition-colors">
            <p className="py-10">
              {stage === "verifying"
                ? "Verifying candidate details…"
                : "Confirming payment…"}
            </p>
          </div>
        )}

        {stage === "success" && receipt && (
          <div className="bg-green-100 dark:bg-green-900 border border-green-200 dark:border-green-800 p-4 rounded transition-colors">
            <h2 className="text-xl font-bold mb-3">Purchase Successful 🎉</h2>

            <p><strong>Service:</strong> {receipt.serviceID}</p>
            <p><strong>Candidate:</strong> {receipt.billersCode}</p>
            <p><strong>Amount:</strong> ₦{receipt.amount}</p>
            <p><strong>Reference:</strong> {receipt.reference}</p>

            <button
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded mt-4 transition-colors"
              onClick={() => {
                setStage("form");
                setReceipt(null);
                setServiceID("");
                setVariationCode("");
                setBillersCode("");
                setPhone("");
                setSelectedAmount(0);
              }}
            >
              Buy Another PIN
            </button>
          </div>
        )}
      </div>
    </BannersWrapper>
  </ResponsiveLandingWrapper>
);
}
