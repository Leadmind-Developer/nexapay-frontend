"use client";

import React, { useState, useEffect } from "react";
import api from "@/lib/api";
import axios from "axios";

type Variation = {
  variation_code: string;
  name: string;
  variation_amount: number;
};

declare global {
  interface Window {
    PaystackPop: any;
  }
}

export default function DataPurchasePage() {
  const [provider, setProvider] = useState<string>("");
  const [billersCode, setBillersCode] = useState("");
  const [variations, setVariations] = useState<Variation[]>([]);
  const [selectedVar, setSelectedVar] = useState<Variation | null>(null);
  const [email, setEmail] = useState("");
  const [loadingPlans, setLoadingPlans] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  const PROVIDERS = [
    { label: "MTN", value: "mtn" },
    { label: "GLO", value: "glo" },
    { label: "Airtel", value: "airtel" },
    { label: "9mobile", value: "etisalat" },
    { label: "Spectranet", value: "spectranet" },
    { label: "Smile", value: "smile" },
  ];

  /** ---------------------------------------------
   *  🔍 Auto-Detect Provider from phone/email
   * --------------------------------------------- */
  useEffect(() => {
    if (!billersCode) return;

    if (billersCode.includes("@")) {
      setProvider("smile");
      return;
    }

    const prefix = billersCode.replace(/^234/, "0").slice(0, 4);

    const MTN = ["0703", "0706", "0803", "0806", "0810", "0813", "0814", "0816", "0903", "0906", "0913"];
    const GLO = ["0705", "0805", "0807", "0811", "0815", "0905"];
    const AIRTEL = ["0701", "0708", "0802", "0808", "0812", "0901", "0902", "0904", "0912"];
    const ETISALAT = ["0709", "0809", "0817", "0818", "0908", "0909"];

    if (MTN.includes(prefix)) setProvider("mtn");
    else if (GLO.includes(prefix)) setProvider("glo");
    else if (AIRTEL.includes(prefix)) setProvider("airtel");
    else if (ETISALAT.includes(prefix)) setProvider("etisalat");
  }, [billersCode]);

  /** ---------------------------------------------
   *  📡 Load Data Plans
   * --------------------------------------------- */
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
    }

    setLoadingPlans(false);
  };

  /** ---------------------------------------------
   *  💳 Paystack Checkout
   * --------------------------------------------- */
  const startPayment = () => {
    if (!selectedVar || !email) return alert("Fill required fields");

    const amount = selectedVar.variation_amount * 100; // convert to KOBO

    const handler = window.PaystackPop.setup({
      key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY!,
      email,
      amount,
      ref: `NEXA-DATA-${Date.now()}`,
      callback: (response: any) => {
        verifyAndPurchase(response.reference);
      },
      onClose: () => alert("Payment cancelled"),
    });

    handler.openIframe();
  };

  /** ---------------------------------------------
   *  🔎 Verify Paystack → Trigger VTpass Purchase
   * --------------------------------------------- */
  const verifyAndPurchase = async (reference: string) => {
    setProcessing(true);
    setStatusMessage("Verifying payment...");

    try {
      const verify = await api.get(`/paystack/verify/${reference}`);
      if (!verify.data?.status) {
        setStatusMessage("Payment not successful");
        setProcessing(false);
        return;
      }

      setStatusMessage("Payment verified. Buying data...");

      const purchase = await api.post(`/vtpass/data/purchase`, {
        provider,
        billersCode,
        variation_code: selectedVar?.variation_code,
        amount: selectedVar?.variation_amount,
      });

      if (purchase.data.success) {
        pollStatus(purchase.data.request_id);
      } else {
        setStatusMessage("Purchase failed.");
        setProcessing(false);
      }
    } catch (e) {
      console.error(e);
      setStatusMessage("Error finalizing purchase.");
      setProcessing(false);
    }
  };

  /** ---------------------------------------------
   *  🔄 Poll VTpass Status (Requery every 5s)
   * --------------------------------------------- */
  const pollStatus = (request_id: string) => {
    setStatusMessage("Transaction submitted...");

    const interval = setInterval(async () => {
      try {
        const res = await api.post(`/vtpass/data/status`, { request_id });
        const status = res.data?.content?.transactions?.status;

        if (["completed", "delivered", "success"].includes(status)) {
          clearInterval(interval);
          setStatusMessage("🎉 Data purchase successful!");
          setProcessing(false);
        }
      } catch (e) {
        console.error(e);
      }
    }, 5000);
  };

  return (
    <div className="max-w-lg mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Buy Data / Internet</h1>

      {/* Billers Code */}
      <input
        value={billersCode}
        onChange={(e) => setBillersCode(e.target.value)}
        className="w-full p-3 border rounded mb-3"
        placeholder="Phone number or Smile email"
      />

      {/* Email for Paystack */}
      <input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full p-3 border rounded mb-3"
        placeholder="Your Email (for payment receipt)"
      />

      {/* Provider Dropdown */}
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

      {/* Data Plans */}
      {loadingPlans ? (
        <p>Loading plans...</p>
      ) : (
        variations.length > 0 && (
          <select
            className="w-full p-3 border rounded mb-3"
            value={selectedVar?.variation_code || ""}
            onChange={(e) => {
              const v = variations.find((x) => x.variation_code === e.target.value);
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
        disabled={!selectedVar || !email || processing}
        className="w-full bg-blue-600 text-white p-3 rounded"
      >
        {processing ? "Processing..." : "Buy Now"}
      </button>

      {statusMessage && (
        <p className="mt-4 p-3 bg-gray-100 rounded text-center">{statusMessage}</p>
      )}
    </div>
  );
}
