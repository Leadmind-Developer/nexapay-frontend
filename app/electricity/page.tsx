"use client";

import React, { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import api, { VTPassAPI } from "@/lib/api";

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
      .get("/vtpass/electricity/discos")
      .then((res) => {
        setDiscos(res.data || []);
        if (res.data?.length) setServiceID(res.data[0].code);
      })
      .catch(() => {
        setMessage("Failed to load electricity providers");
      });
  }, []);

  /* =======================
     Handle Paystack Redirect
  ======================= */

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const reference = params.get("reference");
    if (reference) verifyTransaction(reference);
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
      const res = await VTPassAPI.verify({
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
      const request_id = uuidv4();

      // 1️⃣ Create VTpass transaction
      await VTPassAPI.pay({
        request_id,
        serviceID,
        billersCode,
        variation_code: type,
        amount,
        phone,
      });

      // 2️⃣ Init Paystack
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
      const paystackRes = await api.get(`/paystack/verify/${reference}`);

      if (paystackRes.data.status !== "success") {
        setStage("form");
        setMessage("Payment was not successful");
        return;
      }

      const request_id = paystackRes.data.metadata?.request_id;
      if (!request_id) {
        setStage("form");
        setMessage("Invalid transaction reference");
        return;
      }

      const vtpassRes = await api.post("/vtpass/electricity/status", {
        request_id,
      });

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
      setMessage(err.response?.data?.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  /* =======================
     UI
  ======================= */

  if (stage === "verifying") {
    return <p style={{ padding: 20 }}>Verifying transaction...</p>;
  }

  if (stage === "success" && receipt) {
    return (
      <div style={{ maxWidth: 500, margin: "auto", padding: 20 }}>
        <h1>Electricity Purchase Successful</h1>

        <p><strong>Meter:</strong> {receipt.meter_number}</p>
        <p><strong>Type:</strong> {receipt.type}</p>
        <p><strong>Amount:</strong> ₦{receipt.amount}</p>
        <p><strong>Status:</strong> {receipt.status}</p>

        {receipt.customer_name && (
          <p><strong>Customer:</strong> {receipt.customer_name}</p>
        )}

        {receipt.token && (
          <div style={{ marginTop: 20, padding: 10, background: "#f3f4f6" }}>
            <h3>Prepaid Token</h3>
            <p style={{ fontWeight: "bold", fontSize: 18 }}>{receipt.token}</p>
          </div>
        )}

        <button
          style={{ marginTop: 20, width: "100%", padding: 10 }}
          onClick={() => {
            setStage("form");
            setReceipt(null);
            setVerified(false);
            setMessage("");
          }}
        >
          Buy Again
        </button>
      </div>
    );
  }

  /* =======================
     Form
  ======================= */

  return (
    <div style={{ maxWidth: 500, margin: "auto", padding: 20 }}>
      <h1>Buy Electricity</h1>

      <label>Disco</label>
      <select
        value={serviceID}
        onChange={(e) => setServiceID(e.target.value)}
        style={{ width: "100%", marginBottom: 10 }}
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
        style={{ width: "100%", marginBottom: 10 }}
      />

      <label>Meter Type</label>
      <select
        value={type}
        onChange={(e) => setType(e.target.value as any)}
        style={{ width: "100%", marginBottom: 10 }}
      >
        <option value="prepaid">Prepaid</option>
        <option value="postpaid">Postpaid</option>
      </select>

      {customerName && (
        <p style={{ color: "green" }}>Customer: {customerName}</p>
      )}

      <button
        onClick={handleVerifyMeter}
        disabled={loading}
        style={{ width: "100%", marginBottom: 10 }}
      >
        {loading ? "Verifying..." : "Verify Meter"}
      </button>

      <label>Amount (₦)</label>
      <input
        type="number"
        value={amount}
        onChange={(e) => setAmount(Number(e.target.value))}
        style={{ width: "100%", marginBottom: 10 }}
      />

      <label>Phone Number</label>
      <input
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        style={{ width: "100%", marginBottom: 10 }}
      />

      <label>Email (optional)</label>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
        style={{ width: "100%", marginBottom: 10 }}
      />

      {message && <p style={{ color: verified ? "green" : "red" }}>{message}</p>}

      <button
        onClick={handlePurchase}
        disabled={!verified || loading}
        style={{ width: "100%", padding: 10 }}
      >
        {loading ? "Processing..." : "Pay & Get Token"}
      </button>
    </div>
  );
}
