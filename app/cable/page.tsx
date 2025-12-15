"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion"; // ✅ add framer-motion
import api from "@/lib/api";
import ResponsiveLandingWrapper from "@/components/ResponsiveLandingWrapper";
import BannersWrapper from "@/components/BannersWrapper";

type Variation = {
  variation_code: string;
  name: string;
  variation_amount: number;
};

type ServiceOption = {
  label: string;
  value: string;
};

export default function CablePurchasePage() {
  const [service, setService] = useState<string>("");
  const [smartcard, setSmartcard] = useState("");
  const [variations, setVariations] = useState<Variation[]>([]);
  const [selectedVar, setSelectedVar] = useState<Variation | null>(null);
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [loadingPlans, setLoadingPlans] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [smartcardValid, setSmartcardValid] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [stage, setStage] = useState<"form" | "paying" | "pending" | "success" | "error">("form");
  const [receipt, setReceipt] = useState<any>(null);
  const [statusMessage, setStatusMessage] = useState("");

  const pollingRef = useRef<number | null>(null);
  const verifyTimeout = useRef<number | null>(null);

  const SERVICES: ServiceOption[] = [
    { label: "DStv", value: "dstv" },
    { label: "GOtv", value: "gotv" },
    { label: "Startimes", value: "startimes" },
    { label: "Showmax", value: "showmax" },
  ];

  // Auto-verify smartcard
  useEffect(() => {
    if (!service || !smartcard) {
      setSmartcardValid(false);
      setVariations([]);
      setSelectedVar(null);
      return;
    }

    if (verifyTimeout.current) window.clearTimeout(verifyTimeout.current);

    verifyTimeout.current = window.setTimeout(async () => {
      setVerifying(true);
      setSmartcardValid(false);
      setVariations([]);
      setSelectedVar(null);

      try {
        const res = await api.post("/vtpass/cable/verify", { service, smartcard });
        if (res.data?.content?.customer_name) {
          setSmartcardValid(true);
          loadVariations(service);
        } else {
          setSmartcardValid(false);
        }
      } catch (err) {
        console.error(err);
        setSmartcardValid(false);
      } finally {
        setVerifying(false);
      }
    }, 700);
  }, [service, smartcard]);

  const loadVariations = async (serviceID: string) => {
    if (!serviceID || !smartcardValid) return;
    setLoadingPlans(true);
    setVariations([]);
    setSelectedVar(null);

    try {
      const res = await api.get(`/vtpass/cable/variations?service=${serviceID}`);
      setVariations(res.data.variations || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingPlans(false);
    }
  };

  const pollCableStatus = async (request_id: string) => {
    if (pollingRef.current) return;
    setStage("pending");
    setStatusMessage("Transaction submitted...");

    pollingRef.current = window.setInterval(async () => {
      try {
        const res = await api.post(`/vtpass/cable/status`, { request_id });
        const status = res.data?.content?.transactions?.status;

        if (["completed", "delivered", "success"].includes(status)) {
          if (pollingRef.current) window.clearInterval(pollingRef.current);
          pollingRef.current = null;
          setStatusMessage("🎉 Cable purchase successful!");
          setStage("success");
          setProcessing(false);
        } else if (["failed", "error"].includes(status)) {
          if (pollingRef.current) window.clearInterval(pollingRef.current);
          pollingRef.current = null;
          setStatusMessage("❌ Cable purchase failed. You can retry.");
          setStage("error");
          setProcessing(false);
        }
      } catch (err) {
        console.error(err);
      }
    }, 5000);
  };

  const verifyAndPurchase = async (reference: string) => {
    if (!selectedVar) return;

    try {
      setProcessing(true);
      setStage("paying");

      const verify = await api.get(`/paystack/verify/${reference}`);
      if (verify.data.status !== "success") {
        alert("Payment not completed");
        setStage("form");
        setProcessing(false);
        return;
      }

      const purchase = await api.post("/vtpass/cable/purchase", {
        request_id: `CABLE-${Date.now()}`,
        service,
        smartcard,
        variation_code: selectedVar.variation_code,
        amount: selectedVar.variation_amount,
        phone,
      });

      setReceipt({
        reference,
        service,
        smartcard,
        variation: selectedVar,
        vtpass: purchase.data.result,
      });

      pollCableStatus(purchase.data.request_id);
    } catch (err) {
      console.error(err);
      setStatusMessage("❌ Cable purchase failed. You can retry.");
      setStage("error");
      setProcessing(false);
    }
  };

  const startPayment = async () => {
    if (!selectedVar || !email || !service || !smartcard || !smartcardValid)
      return alert("Fill all required fields and verify smartcard");

    try {
      setProcessing(true);
      setStage("paying");

      const reference = `CABLE-${Date.now()}`;
      const initRes = await api.post("/paystack/initialize", {
        email,
        amount: selectedVar.variation_amount * 100,
        reference,
        metadata: {
          purpose: "cable_purchase",
          service,
          smartcard,
          variation_code: selectedVar.variation_code,
          amount: selectedVar.variation_amount,
          phone,
        },
        callback_url: `${window.location.origin}/cable?ref=${reference}`,
      });

      window.location.href = initRes.data.data.authorization_url;
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || "Payment initialization failed");
      setProcessing(false);
      setStage("form");
    }
  };

  useEffect(() => {
    const url = new URL(window.location.href);
    const ref = url.searchParams.get("ref");
    if (ref && selectedVar && service && smartcard) {
      verifyAndPurchase(ref);
    }
  }, [selectedVar, service, smartcard]);

  // Wizard Steps
  const steps = ["Enter Details", "Payment", "Pending", "Complete"];
  const stageIndex = ["form", "paying", "pending", "success", "error"].indexOf(stage);

  return (
    <ResponsiveLandingWrapper>
      <BannersWrapper page="cable">
        <div className="max-w-md mx-auto px-4">

          {/* Animated Step Wizard */}
          <div className="flex items-center justify-between mb-8 relative">
            {steps.map((label, idx) => {
              const isActive = idx <= stageIndex;

              return (
                <div key={idx} className="flex-1 flex items-center">
                  {/* Animated Circle */}
                  <motion.div
                    layout
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className={`w-10 h-10 rounded-full flex items-center justify-center z-10 border-2 ${isActive ? "border-yellow-500 bg-yellow-500 text-white" : "border-gray-300 bg-white text-gray-500"}`}
                  >
                    {idx + 1}
                  </motion.div>

                  {/* Animated Line */}
                  {idx < steps.length - 1 && (
                    <motion.div
                      className={`flex-1 h-1 -ml-1 rounded`}
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: idx < stageIndex ? 1 : 0 }}
                      transition={{ duration: 0.5, ease: "easeInOut" }}
                      style={{ transformOrigin: "left", backgroundColor: idx < stageIndex ? "#F59E0B" : "#D1D5DB" }}
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* Step Content */}
          {stage === "form" && (
            <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 space-y-4 transition-colors">
              <h2 className="text-xl font-bold">Cable Subscription</h2>
              <input
                value={smartcard}
                onChange={(e) => {
                  setSmartcard(e.target.value);
                  setSmartcardValid(false);
                  setVariations([]);
                  setSelectedVar(null);
                }}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded mb-3 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-yellow-400 transition-colors"
                placeholder="Smartcard Number"
              />
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded mb-3 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-yellow-400 transition-colors"
                placeholder="Phone Number (optional)"
              />
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded mb-3 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-yellow-400 transition-colors"
                placeholder="Email (for payment receipt)"
              />
              <select
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded mb-3 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-yellow-400 transition-colors"
                value={service}
                onChange={(e) => {
                  setService(e.target.value);
                  setSmartcardValid(false);
                  setVariations([]);
                  setSelectedVar(null);
                }}
              >
                <option value="">Select Service</option>
                {SERVICES.map(s => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>

              {verifying && <p className="text-gray-500">Verifying smartcard...</p>}

              {smartcardValid && (
                <>
                  {loadingPlans ? (
                    <p>Loading packages...</p>
                  ) : (
                    variations.length > 0 && (
                      <select
                        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded mb-3 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-yellow-400 transition-colors"
                        value={selectedVar?.variation_code || ""}
                        onChange={(e) => {
                          const v = variations.find(x => x.variation_code === e.target.value);
                          setSelectedVar(v || null);
                        }}
                      >
                        <option value="">Select Package</option>
                        {variations.map(v => (
                          <option key={v.variation_code} value={v.variation_code}>
                            {v.name} — ₦{v.variation_amount}
                          </option>
                        ))}
                      </select>
                    )
                  )}

                  <button
                    onClick={startPayment}
                    disabled={!selectedVar || !email || processing}
                    className="w-full bg-yellow-500 hover:bg-yellow-600 text-white p-3 rounded transition-colors"
                  >
                    {processing ? "Processing..." : "Pay & Buy Cable"}
                  </button>
                </>
              )}
            </div>
          )}

          {(stage === "paying" || stage === "pending") && (
            <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 text-center transition-colors">
              <p className="py-10">{stage === "paying" ? "Redirecting to Paystack…" : statusMessage}</p>
            </div>
          )}

          {(stage === "error") && (
            <div className="bg-red-100 dark:bg-red-900 border border-red-200 dark:border-red-800 p-4 rounded transition-colors">
              <p className="mb-3">{statusMessage}</p>
              <button
                className="w-full bg-yellow-600 hover:bg-yellow-700 text-white py-3 rounded"
                onClick={() => {
                  if (receipt && receipt.vtpass?.request_id) pollCableStatus(receipt.vtpass.request_id);
                }}
                disabled={!!pollingRef.current}
              >
                Retry Purchase
              </button>
            </div>
          )}

          {(stage === "success" && receipt) && (
            <div className="bg-green-100 dark:bg-green-900 border border-green-200 dark:border-green-800 p-4 rounded transition-colors">
              <h2 className="text-xl font-bold mb-3">Cable Purchase Successful 🎉</h2>
              <p><strong>Service:</strong> {receipt.service}</p>
              <p><strong>Smartcard:</strong> {receipt.smartcard}</p>
              <p><strong>Package:</strong> {receipt.variation?.name}</p>
              <p><strong>Amount:</strong> ₦{receipt.variation?.variation_amount}</p>
              <p><strong>Reference:</strong> {receipt.reference}</p>

              <hr className="my-4" />

              <button
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-white py-3 rounded transition-colors"
                onClick={() => {
                  setStage("form");
                  setReceipt(null);
                  setSelectedVar(null);
                  setSmartcardValid(false);
                  setVariations([]);
                  setStatusMessage("");
                }}
              >
                Buy Again
              </button>
            </div>
          )}
        </div>
      </BannersWrapper>
    </ResponsiveLandingWrapper>
  );
}
