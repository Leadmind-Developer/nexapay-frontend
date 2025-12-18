"use client";

import React, { useEffect, useState } from "react";
import api, { VTPassAPI } from "@/lib/api";
import ResponsiveLandingWrapper from "@/components/ResponsiveLandingWrapper";
import BannersWrapper from "@/components/BannersWrapper";

interface Disco {
  code: string;
  name: string;
  label: string;
}

interface ElectricityReceipt {
  request_id: string;
  amount: number;
  status: string;
  customer_name?: string;
  token?: string;
  meter_number?: string;
  type?: "prepaid" | "postpaid";
}

interface VerifyMeterResponse {
  customer_name: string;
}

interface VTpassStatusResponse {
  amount?: number;
  purchased_amount?: number;
  response_description?: string;
  status?: string;
  customer_name?: string;
  token?: string;
  token_code?: string;
  billersCode?: string;
  billers_code?: string;
  variation_code?: "prepaid" | "postpaid";
}

interface PaystackVerifyResponse {
  status: "success" | string;
  metadata?: {
    request_id?: string;
  };
}

export default function ElectricityPage() {
  const [discos, setDiscos] = useState<Disco[]>([]);
  const [serviceID, setServiceID] = useState("");
  const [billersCode, setBillersCode] = useState("");
  const [type, setType] = useState<"prepaid" | "postpaid">("prepaid");
  const [amount, setAmount] = useState<number>(0);
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [verified, setVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [stage, setStage] = useState<"verify" | "payment" | "success">("verify");
  const [receipt, setReceipt] = useState<ElectricityReceipt | null>(null);

  // Load Discos
  useEffect(() => {
    api.get<Disco[]>("/vtpass/electricity/discos")
      .then(res => {
        const data = res.data ?? [];
        setDiscos(data);
        if (data.length) setServiceID(data[0].code);
      })
      .catch(() => setMessage("Failed to load electricity providers"));
  }, []);

  // Handle Paystack redirect
  useEffect(() => {
    const reference = new URLSearchParams(window.location.search).get("reference");
    if (reference) verifyTransaction(reference);
  }, []);

  // Step 1: Verify Meter
const handleVerifyMeter = async () => {
  if (!serviceID || !billersCode) {
    setMessage("Please select a Disco and enter meter number");
    return;
  }

  setLoading(true);
  setMessage("");
  setVerified(false);
  setCustomerName("");

  try {
    const res = await api.post<VerifyMeterResponse>("/vtpass/electricity/verify", {
      serviceID,
      billersCode,
      type,
    });

    if (!res.data?.customer_name) throw new Error("Invalid response from VTpass");

    setCustomerName(res.data.customer_name);
    setVerified(true);
    setMessage(`Meter verified: ${res.data.customer_name}`);
    setStage("payment");
  } catch (err: any) {
    setMessage(err.response?.data?.message || err.message || "Meter verification failed");
  } finally {
    setLoading(false);
  }
};

// Step 2: Payment
const handlePurchase = async () => {
  if (!verified) return setMessage("Please verify meter first");
  if (!amount || !phone) return setMessage("Amount and phone number are required");

  setLoading(true);
  setMessage("");

  try {
    const request_id = crypto.randomUUID();

    // Call VTpass purchase endpoint
    await api.post("/vtpass/electricity/purchase", {
      request_id,
      serviceID,
      billersCode,
      variation_code: type,
      amount,
      phone,
    });

    // Initialize Paystack payment
    const reference = `ELEC-${Date.now()}`;
    const guestEmail = email || `${phone}@nexapay.fake`;
    const callback_url = `${window.location.origin}/electricity?reference=${reference}`;

    const psRes = await api.post("/paystack/initialize", {
      amount,
      email: guestEmail,
      reference,
      callback_url,
      metadata: { request_id, purpose: "electricity_purchase" },
    });

    const authorizationUrl = psRes.data?.data?.authorization_url;
    if (!authorizationUrl) throw new Error("Failed to get Paystack authorization URL");

    window.location.href = authorizationUrl;
  } catch (err: any) {
    setMessage(err.response?.data?.message || err.message || "Payment initialization failed");
  } finally {
    setLoading(false);
  }
};

// Step 3: Verify Payment
const verifyTransaction = async (reference: string) => {
  if (!reference) return;

  setStage("verify");
  setLoading(true);
  setMessage("");

  try {
    // Verify Paystack transaction
    const paystackRes = await api.get<PaystackVerifyResponse>(`/paystack/verify/${reference}`);
    if (paystackRes.data.status !== "success") throw new Error("Payment not successful");

    const request_id = paystackRes.data.metadata?.request_id;
    if (!request_id) throw new Error("Invalid transaction reference");

    // Check VTpass status
    const vtpassRes = await api.post<VTpassStatusResponse>("/vtpass/electricity/status", { request_id });
    const v = vtpassRes.data;

    setReceipt({
      request_id,
      amount: Number(v.amount ?? v.purchased_amount ?? 0),
      status: v.response_description || v.status || "success",
      customer_name: v.customer_name,
      token: v.token || v.token_code,
      meter_number: v.billersCode || v.billers_code,
      type: v.variation_code,
    });

    setStage("success");
    setMessage("Purchase successful");
  } catch (err: any) {
    setMessage(err.response?.data?.message || err.message || "Verification failed");
  } finally {
    setLoading(false);
  }
};

  const stepClasses = (step: number) =>
    `flex-1 text-center py-2 font-semibold ${
      (stage === "verify" && step === 1) ||
      (stage === "payment" && step === 2) ||
      (stage === "success" && step === 3)
        ? "text-yellow-700"
        : "text-gray-400 dark:text-gray-500"
    }`;

  const progressWidth = () => {
    switch (stage) {
      case "verify": return "33%";
      case "payment": return "66%";
      case "success": return "100%";
      default: return "0%";
    }
  };

  return (
    <ResponsiveLandingWrapper>
      <BannersWrapper page="electricity">
        <div className="max-w-md mx-auto px-4">
          {/* Step Indicators with Progress Bar */}
          <div className="mb-6">
            <div className="flex border-b-2 border-gray-200 dark:border-gray-700 relative">
              <div className={stepClasses(1)}>1. Verify Meter</div>
              <div className={stepClasses(2)}>2. Payment</div>
              <div className={stepClasses(3)}>3. Success</div>
              {/* Progress bar */}
              <div className="absolute bottom-0 left-0 h-1 bg-yellow-500 dark:bg-yellow-400 transition-all" style={{ width: progressWidth() }} />
            </div>
          </div>

          {/* Step Content */}
          {stage === "verify" && (
            <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 space-y-4 transition-colors">
              <h2 className="text-xl font-bold">Verify Your Meter</h2>
              <label className="block text-sm font-medium">Disco</label>
              <select
                value={serviceID}
                onChange={e => setServiceID(e.target.value)}
                className="w-full border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-md p-2 focus:ring-2 focus:ring-yellow-400 transition-colors"
              >
                {discos.map(d => (
                  <option key={d.code} value={d.code}>{d.label}</option>
                ))}
              </select>
              <label className="block text-sm font-medium">Meter Number</label>
              <input
                value={billersCode}
                onChange={e => { setBillersCode(e.target.value); setVerified(false); setCustomerName(""); }}
                className="w-full border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-md p-2 focus:ring-2 focus:ring-yellow-400 transition-colors"
              />
              <label className="block text-sm font-medium">Meter Type</label>
              <select
                value={type}
                onChange={e => setType(e.target.value as "prepaid" | "postpaid")}
                className="w-full border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-md p-2 focus:ring-2 focus:ring-yellow-400 transition-colors"
              >
                <option value="prepaid">Prepaid</option>
                <option value="postpaid">Postpaid</option>
              </select>
              {customerName && <p className="text-green-600 font-medium">Customer: {customerName}</p>}
              {message && <p className="text-red-600 font-medium">{message}</p>}
              <button
                onClick={handleVerifyMeter}
                disabled={loading}
                className="w-full py-2 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold rounded-lg transition-colors"
              >
                {loading ? "Verifying…" : "Verify Meter"}
              </button>
            </div>
          )}

          {stage === "payment" && (
            <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 space-y-4 transition-colors">
              <h2 className="text-xl font-bold">Payment</h2>
              <label className="block text-sm font-medium">Amount (₦)</label>
              <input
                type="number"
                value={amount}
                onChange={e => setAmount(Number(e.target.value))}
                className="w-full border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-md p-2 focus:ring-2 focus:ring-yellow-400 transition-colors"
              />
              <label className="block text-sm font-medium">Phone Number</label>
              <input
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-md p-2 focus:ring-2 focus:ring-yellow-400 transition-colors"
              />
              <label className="block text-sm font-medium">Email (optional)</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-md p-2 focus:ring-2 focus:ring-yellow-400 transition-colors"
              />
              {message && <p className="text-red-600 font-medium">{message}</p>}
              <button
                onClick={handlePurchase}
                disabled={loading}
                className="w-full py-2 bg-black hover:bg-gray-900 text-white font-semibold rounded-lg transition-colors"
              >
                {loading ? "Processing…" : "Pay & Get Token"}
              </button>
            </div>
          )}

          {stage === "success" && receipt && (
            <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 space-y-4 transition-colors">
              <h2 className="text-xl font-bold text-center text-green-700">Purchase Successful</h2>
              <div className="space-y-1 text-sm">
                <p><strong>Meter:</strong> {receipt.meter_number}</p>
                <p><strong>Type:</strong> {receipt.type}</p>
                <p><strong>Amount:</strong> ₦{receipt.amount}</p>
                <p><strong>Status:</strong> {receipt.status}</p>
                {receipt.customer_name && <p><strong>Customer:</strong> {receipt.customer_name}</p>}
              </div>
              {receipt.token && (
                <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-700 rounded-lg text-center transition-colors">
                  <h3 className="font-semibold">Prepaid Token</h3>
                  <p className="text-lg font-bold tracking-wide">{receipt.token}</p>
                </div>
              )}
              <button
                onClick={() => { setStage("verify"); setReceipt(null); setVerified(false); setMessage(""); }}
                className="w-full py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors"
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
