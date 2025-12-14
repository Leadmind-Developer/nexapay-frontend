"use client";

import React, { useEffect, useState } from "react";
import api, { VTPassAPI } from "@/lib/api";
import ResponsiveLandingWrapper from "@/components/ResponsiveLandingWrapper";
import BannersWrapper from "@/components/BannersWrapper";

/* =======================
   Types
======================= */

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

/* =======================
   Page
======================= */

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

  const [stage, setStage] = useState<"form" | "verifying" | "success">("form");
  const [receipt, setReceipt] = useState<ElectricityReceipt | null>(null);

  /* =======================
     Load Discos
  ======================= */

  useEffect(() => {
    api
      .get<Disco[]>("/vtpass/electricity/discos")
      .then((res) => {
        const data = res.data ?? [];
        setDiscos(data);
        if (data.length) setServiceID(data[0].code);
      })
      .catch(() => setMessage("Failed to load electricity providers"));
  }, []);

  /* =======================
     Handle Paystack Redirect
  ======================= */

  useEffect(() => {
    const reference = new URLSearchParams(window.location.search).get(
      "reference"
    );
    if (reference) verifyTransaction(reference);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* =======================
     Verify Meter
  ======================= */

  const handleVerifyMeter = async () => {
    if (!serviceID || !billersCode) {
      setMessage("Please select a Disco and enter meter number");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const res = await VTPassAPI.verify<VerifyMeterResponse>({
        serviceID,
        billersCode,
        type,
      });

      setCustomerName(res.data.customer_name);
      setVerified(true);
      setMessage(`Meter verified: ${res.data.customer_name}`);
    } catch (err: any) {
      setVerified(false);
      setCustomerName("");
      setMessage(err.response?.data?.message || "Meter verification failed");
    } finally {
      setLoading(false);
    }
  };

  /* =======================
     Purchase + Paystack
  ======================= */

  const handlePurchase = async () => {
    if (!verified) {
      setMessage("Please verify meter first");
      return;
    }

    if (!amount || !phone) {
      setMessage("Amount and phone number are required");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const request_id = crypto.randomUUID();

      await VTPassAPI.pay({
        request_id,
        serviceID,
        billersCode,
        variation_code: type,
        amount,
        phone,
      });

      const reference = `ELEC-${Date.now()}`;
      const guestEmail = email || `${phone}@nexapay.fake`;

      const callback_url = `${window.location.origin}/electricity?reference=${reference}`;

      const ps = await api.post("/paystack/initialize", {
        amount,
        email: guestEmail,
        reference,
        callback_url,
        metadata: {
          request_id,
          purpose: "electricity_purchase",
        },
      });

      window.location.href = ps.data.data.authorization_url;
    } catch (err: any) {
      setMessage(err.response?.data?.message || "Payment initialization failed");
    } finally {
      setLoading(false);
    }
  };

  /* =======================
     Verify Payment
  ======================= */

  const verifyTransaction = async (reference: string) => {
    setStage("verifying");
    setLoading(true);
    setMessage("");

    try {
      const paystackRes = await api.get<PaystackVerifyResponse>(
        `/paystack/verify/${reference}`
      );

      if (paystackRes.data.status !== "success") {
        throw new Error("Payment was not successful");
      }

      const request_id = paystackRes.data.metadata?.request_id;
      if (!request_id) {
        throw new Error("Invalid transaction reference");
      }

      const vtpassRes = await api.post<VTpassStatusResponse>(
        "/vtpass/electricity/status",
        { request_id }
      );

      const v = vtpassRes.data;

      setReceipt({
        request_id,
        amount: Number(v.amount || v.purchased_amount || 0),
        status: v.response_description || v.status || "success",
        customer_name: v.customer_name,
        token: v.token || v.token_code,
        meter_number: v.billersCode || v.billers_code,
        type: v.variation_code,
      });

      setStage("success");
    } catch (err: any) {
      setStage("form");
      setMessage(err.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  /* =======================
     UI
  ======================= */

  return (
    <ResponsiveLandingWrapper>
      <BannersWrapper page="electricity">
        <div className="shell-content max-w-md mx-auto px-4">
          {stage === "verifying" && (
            <p className="text-center text-sm">Verifying transaction…</p>
          )}

          {stage === "success" && receipt && (
            <>
              <h1 className="text-2xl font-bold mb-4">
                Electricity Purchase Successful
              </h1>

              <div className="space-y-1 text-sm">
                <p><strong>Meter:</strong> {receipt.meter_number}</p>
                <p><strong>Type:</strong> {receipt.type}</p>
                <p><strong>Amount:</strong> ₦{receipt.amount}</p>
                <p><strong>Status:</strong> {receipt.status}</p>
                {receipt.customer_name && (
                  <p><strong>Customer:</strong> {receipt.customer_name}</p>
                )}
              </div>

              {receipt.token && (
                <div className="mt-4 p-3 bg-gray-100 rounded">
                  <h3 className="font-semibold">Prepaid Token</h3>
                  <p className="text-lg font-bold tracking-wide">
                    {receipt.token}
                  </p>
                </div>
              )}

              <button
                className="mt-6 w-full py-2 bg-black text-white rounded"
                onClick={() => {
                  setStage("form");
                  setReceipt(null);
                  setVerified(false);
                  setMessage("");
                }}
              >
                Buy Again
              </button>
            </>
          )}

          {stage === "form" && (
            <>
              <h1 className="text-2xl font-bold mb-4">Buy Electricity</h1>

              <label>Disco</label>
              <select
                value={serviceID}
                onChange={(e) => setServiceID(e.target.value)}
                className="w-full mb-2"
              >
                {discos.map((d) => (
                  <option key={d.code} value={d.code}>
                    {d.label}
                  </option>
                ))}
              </select>

              <label>Meter Number</label>
              <input
                value={billersCode}
                onChange={(e) => {
                  setBillersCode(e.target.value);
                  setVerified(false);
                  setCustomerName("");
                }}
                className="w-full mb-2"
              />

              <label>Meter Type</label>
              <select
                value={type}
                onChange={(e) =>
                  setType(e.target.value as "prepaid" | "postpaid")
                }
                className="w-full mb-2"
              >
                <option value="prepaid">Prepaid</option>
                <option value="postpaid">Postpaid</option>
              </select>

              {customerName && (
                <p className="text-green-600 mb-2">
                  Customer: {customerName}
                </p>
              )}

              <button
                onClick={handleVerifyMeter}
                disabled={loading}
                className="w-full mb-3 py-2 bg-gray-800 text-white rounded"
              >
                {loading ? "Verifying…" : "Verify Meter"}
              </button>

              <label>Amount (₦)</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full mb-2"
              />

              <label>Phone Number</label>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full mb-2"
              />

              <label>Email (optional)</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full mb-3"
              />

              {message && (
                <p className={verified ? "text-green-600" : "text-red-600"}>
                  {message}
                </p>
              )}

              <button
                onClick={handlePurchase}
                disabled={!verified || loading}
                className="w-full py-2 bg-black text-white rounded mt-3"
              >
                {loading ? "Processing…" : "Pay & Get Token"}
              </button>
            </>
          )}
        </div>
      </BannersWrapper>
    </ResponsiveLandingWrapper>
  );
}
