"use client";

import React, { useState, useEffect, useRef } from "react";
import api from "@/lib/api";
import ResponsiveLandingWrapper from "@/components/ResponsiveLandingWrapper";
import BannersWrapper from "@/components/BannersWrapper";

type Variation = {
  variation_code: string;
  name: string;
  variation_amount: number;
};

export default function DataPurchasePage() {
  const [provider, setProvider] = useState("");
  const [billersCode, setBillersCode] = useState("");
  const [variations, setVariations] = useState<Variation[]>([]);
  const [selectedVar, setSelectedVar] = useState<Variation | null>(null);
  const [email, setEmail] = useState("");
  const [loadingPlans, setLoadingPlans] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [stage, setStage] = useState<"form" | "paying" | "pending" | "success" | "error">("form");
  const [receipt, setReceipt] = useState<any>(null);
  const [statusMessage, setStatusMessage] = useState("");

  // ✅ Browser-safe ref for polling
  const pollingRef = useRef<number | null>(null);

  const PROVIDERS = [
    { label: "MTN", value: "mtn" },
    { label: "GLO", value: "glo" },
    { label: "Airtel", value: "airtel" },
    { label: "9mobile", value: "etisalat" },
    { label: "Spectranet", value: "spectranet" },
    { label: "Smile", value: "smile" },
  ];

  useEffect(() => {
    if (!billersCode) return;
    if (billersCode.includes("@")) {
      setProvider("smile");
      return;
    }
    const prefix = billersCode.replace(/^234/, "0").slice(0, 4);
    const MTN = ["0703","0706","0803","0806","0810","0813","0814","0816","0903","0906","0913"];
    const GLO = ["0705","0805","0807","0811","0815","0905"];
    const AIRTEL = ["0701","0708","0802","0808","0812","0901","0902","0904","0912"];
    const ETISALAT = ["0709","0809","0817","0818","0908","0909"];
    if (MTN.includes(prefix)) setProvider("mtn");
    else if (GLO.includes(prefix)) setProvider("glo");
    else if (AIRTEL.includes(prefix)) setProvider("airtel");
    else if (ETISALAT.includes(prefix)) setProvider("etisalat");
  }, [billersCode]);

  const loadVariations = async (prov: string) => {
    if (!prov) return;
    setLoadingPlans(true);
    setVariations([]);
    setSelectedVar(null);
    try {
      const res = await api.get(`/vtpass/data/variations/${prov}`);
      setVariations(res.data.variations || []);
    } catch (err) {
      console.error(err);
      alert("Failed to load plans.");
    } finally {
      setLoadingPlans(false);
    }
  };

  const pollVTpassStatus = (request_id: string) => {
    if (pollingRef.current) return;
    setStage("pending");
    setStatusMessage("Transaction submitted...");

    pollingRef.current = window.setInterval(async () => {
      try {
        const res = await api.post(`/vtpass/data/status`, { request_id });
        const status = res.data?.content?.transactions?.status;

        if (["completed", "delivered", "success"].includes(status)) {
          if (pollingRef.current) window.clearInterval(pollingRef.current);
          pollingRef.current = null;
          setStatusMessage("🎉 Data purchase successful!");
          setStage("success");
          setProcessing(false);
        } else if (["failed", "error"].includes(status)) {
          if (pollingRef.current) window.clearInterval(pollingRef.current);
          pollingRef.current = null;
          setStatusMessage("❌ Data purchase failed. You can retry.");
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

      const purchase = await api.post("/vtpass/data/purchase", {
        provider,
        billersCode,
        variation_code: selectedVar.variation_code,
        amount: selectedVar.variation_amount,
      });

      setReceipt({
        reference,
        provider,
        billersCode,
        variation: selectedVar,
        vtpass: purchase.data.result,
      });

      pollVTpassStatus(purchase.data.request_id);
    } catch (err) {
      console.error(err);
      setStatusMessage("❌ Data purchase failed. You can retry.");
      setStage("error");
      setProcessing(false);
    }
  };

  const startPayment = async () => {
    if (!selectedVar || !email || !provider || !billersCode)
      return alert("Fill all required fields");

    try {
      setProcessing(true);
      setStage("paying");

      const reference = `DATA-${Date.now()}`;
      const initRes = await api.post("/paystack/initialize", {
        email,
        amount: selectedVar.variation_amount * 100,
        reference,
        metadata: {
          purpose: "data_purchase",
          provider,
          billersCode,
          variation_code: selectedVar.variation_code,
          amount: selectedVar.variation_amount,
        },
        callback_url: `${window.location.origin}/data?ref=${reference}`,
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
    if (ref && selectedVar && provider && billersCode) {
      verifyAndPurchase(ref);
    }
  }, [selectedVar, provider, billersCode]);

  return (
  <ResponsiveLandingWrapper>
    <BannersWrapper page="data">
      <div className="max-w-lg mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">Buy Data / Internet</h1>

        {stage === "form" && (
          <>
            <input
              value={billersCode}
              onChange={(e) => setBillersCode(e.target.value)}
              className="w-full p-3 border rounded mb-3"
              placeholder="Phone number or Smile email"
            />

            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border rounded mb-3"
              placeholder="Email (for payment receipt)"
            />

            <select
              className="w-full p-3 border rounded mb-3"
              value={provider}
              onChange={(e) => {
                setProvider(e.target.value);
                loadVariations(e.target.value);
              }}
            >
              <option value="">Select Provider</option>
              {PROVIDERS.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>

            {loadingPlans ? (
              <p>Loading plans...</p>
            ) : (
              variations.length > 0 && (
                <select
                  className="w-full p-3 border rounded mb-3"
                  value={selectedVar?.variation_code || ""}
                  onChange={(e) => {
                    const v = variations.find(
                      (x) => x.variation_code === e.target.value
                    );
                    setSelectedVar(v || null);
                  }}
                >
                  <option value="">Select Data Bundle</option>
                  {variations.map((v) => (
                    <option key={v.variation_code} value={v.variation_code}>
                      {v.name} — ₦{v.variation_amount}
                    </option>
                  ))}
                </select>
              )
            )}

            <button
              onClick={startPayment}
              disabled={
                !selectedVar || !email || !provider || !billersCode || processing
              }
              className="w-full bg-blue-600 hover:bg-blue-700 text-white p-3 rounded transition-colors"
            >
              {processing ? "Processing..." : "Pay & Buy Data"}
            </button>
          </>
        )}

        {(stage === "paying" || stage === "pending") && (
          <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 text-center">
            <p className="py-10">
              {stage === "paying"
                ? "Redirecting to Paystack…"
                : statusMessage}
            </p>
          </div>
        )}

        {stage === "error" && (
          <div className="p-4 bg-red-100 border border-red-200 rounded">
            <p className="mb-3">{statusMessage}</p>
            <button
              className="w-full bg-yellow-600 hover:bg-yellow-700 text-white py-3 rounded"
              onClick={() => {
                if (receipt?.vtpass?.request_id)
                  pollVTpassStatus(receipt.vtpass.request_id);
              }}
              disabled={!!pollingRef.current}
            >
              Retry Purchase
            </button>
          </div>
        )}

        {stage === "success" && receipt && (
          <div className="p-4 bg-green-100 border border-green-200 rounded">
            <h2 className="text-xl font-bold mb-3">
              Data Purchase Successful 🎉
            </h2>
            <p>
              <strong>Provider:</strong> {receipt.provider}
            </p>
            <p>
              <strong>Billers Code:</strong> {receipt.billersCode}
            </p>
            <p>
              <strong>Bundle:</strong> {receipt.variation?.name}
            </p>
            <p>
              <strong>Amount:</strong> ₦{receipt.variation?.variation_amount}
            </p>
            <p>
              <strong>Reference:</strong> {receipt.reference}
            </p>

            <hr className="my-4" />

            <button
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded transition-colors"
              onClick={() => {
                setStage("form");
                setReceipt(null);
                setSelectedVar(null);
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
