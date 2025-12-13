"use client";

import React, { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import api, { VTPassAPI } from "@/lib/api";

interface Disco {
  code: string;
  name: string;
  label: string;
}

interface ElectricityStatus {
  request_id: string;
  amount: number;
  status: string;
  customer_name?: string;
  token?: string;
  meter_number?: string;
  type?: "prepaid" | "postpaid";
}

export default function ElectricityPage() {
  const [discos, setDiscos] = useState<Disco[]>([]);
  const [serviceID, setServiceID] = useState("");
  const [billersCode, setBillersCode] = useState("");
  const [type, setType] = useState<"prepaid" | "postpaid">("prepaid");
  const [amount, setAmount] = useState<number>(0);
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [verified, setVerified] = useState(false);
  const [stage, setStage] = useState<"form" | "verifying" | "success">("form");
  const [receipt, setReceipt] = useState<ElectricityStatus | null>(null);

  // Fetch discos on mount
  useEffect(() => {
    api.get("/vtpass/electricity/discos")
      .then(res => {
        setDiscos(res.data);
        if (res.data.length) setServiceID(res.data[0].code);
      })
      .catch(err => console.error("Failed to fetch discos:", err));
  }, []);

  // Detect Paystack redirect
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const reference = params.get("reference");
    if (reference) {
      verifyTransaction(reference);
    }
  }, []);

  const handleVerifyMeter = async () => {
    if (!serviceID || !billersCode) {
      setMessage("Please select a Disco and enter Meter Number");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const res = await VTPassAPI.verify({ serviceID, billersCode, type });
      setCustomerName(res.data.customer_name);
      setVerified(true);
      setMessage(`Meter verified: ${res.data.customer_name}`);
    } catch (err: any) {
      console.error(err);
      setMessage(err.response?.data?.message || "Failed to verify meter");
      setVerified(false);
      setCustomerName("");
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async () => {
    if (!verified) {
      setMessage("Please verify meter before purchasing");
      return;
    }
    if (!amount || !phone) {
      setMessage("Please enter amount and phone number");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const request_id = uuidv4();

      // Create electricity purchase request
      await VTPassAPI.pay({
        request_id,
        serviceID,
        billersCode,
        variation_code: type,
        amount,
        phone,
      });

      // Initialize Paystack
      const paystackRef = `ELEC-${Date.now()}`;
      const email = `${phone}@nexapay.fake`;
      const callback_url = `${window.location.origin}/electricity?reference=${paystackRef}`;

      const ps = await api.post("/paystack/initialize", {
        amount,
        email,
        reference: paystackRef,
        callback_url,
        metadata: { request_id, purpose: "electricity_purchase" },
      });

      // Redirect to Paystack
      const { authorization_url } = ps.data.data;
      window.location.href = authorization_url;
    } catch (err: any) {
      console.error("Purchase failed:", err.response?.data || err.message);
      setMessage(err.response?.data?.message || "Failed to initiate electricity purchase");
    } finally {
      setLoading(false);
    }
  };

  const verifyTransaction = async (reference: string) => {
    setStage("verifying");
    setMessage("");
    setLoading(true);

    try {
      // Verify Paystack transaction
      const paystackRes = await api.get(`/paystack/verify/${reference}`);
      if (paystackRes.data.status !== "success") {
        setMessage("Payment not successful.");
        setStage("form");
        return;
      }

      const request_id = paystackRes.data.metadata?.request_id;
      if (!request_id) {
        setMessage("Invalid transaction metadata.");
        setStage("form");
        return;
      }

      // Check VTpass electricity transaction status
      const vtpassRes = await api.post("/vtpass/electricity/status", {
        request_id,
      });
      
      const vtData = vtpassRes.data;

      if (!vtData || vtData.error) {
        setMessage(vtData?.error || "Failed to retrieve electricity status.");
        setStage("form");
        return;
      }

      setReceipt({
        request_id,
        amount: Number(vtData.amount || vtData.purchased_amount || 0),
        status: vtData.response_description || vtData.status || "success",
        customer_name: vtData.customer_name,
        token: vtData.token || vtData.token_code,
        meter_number: vtData.billersCode || vtData.billers_code,
        type: vtData.variation_code,
      });
      setStage("success");
      setMessage("");
    } catch (err: any) {
      console.error(err);
      setMessage(err.response?.data?.message || err.message || "Something went wrong");
      setStage("form");
    } finally {
      setLoading(false);
    }
  };

  // --- Render ---
  if (stage === "verifying") return <p style={{ padding: 20 }}>Verifying transaction...</p>;

  if (stage === "success" && receipt) {
    return (
      <div style={{ maxWidth: 500, margin: "auto", padding: 20 }}>
        <h1>Electricity Purchase Successful!</h1>
        <p><strong>Meter Number:</strong> {receipt.meter_number}</p>
        <p><strong>Type:</strong> {receipt.type}</p>
        <p><strong>Amount:</strong> ₦{receipt.amount}</p>
        <p><strong>Status:</strong> {receipt.status}</p>
        {receipt.customer_name && <p><strong>Customer Name:</strong> {receipt.customer_name}</p>}

        {receipt.token && (
          <div style={{ marginTop: 20, padding: 10, background: "#f0f0f0", wordBreak: "break-all" }}>
            <h3>Prepaid Token:</h3>
            <p style={{ fontSize: 18, fontWeight: "bold" }}>{receipt.token}</p>
          </div>
        )}

        {!receipt.token && receipt.type === "postpaid" && (
          <p>Please pay your bill at the nearest outlet or via your electricity provider.</p>
        )}

        <button
          style={{ marginTop: 20, padding: 10, width: "100%", background: "#3b82f6", color: "white", borderRadius: 5 }}
          onClick={() => {
            setStage("form");
            setReceipt(null);
            setMessage("");
          }}
        >
          Buy Again
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 500, margin: "auto", padding: 20 }}>
      <h1>Buy Electricity</h1>

      <label>Disco:</label>
      <select
        value={serviceID}
        onChange={(e) => setServiceID(e.target.value)}
        style={{ width: "100%", marginBottom: 10 }}
      >
        {discos.map((d) => (
          <option key={d.code} value={d.code}>{d.label}</option>
        ))}
      </select>

      <label>Meter Number:</label>
      <input
        type="text"
        value={billersCode}
        onChange={(e) => {
          setBillersCode(e.target.value);
          setVerified(false);
          setCustomerName("");
        }}
        style={{ width: "100%", marginBottom: 10 }}
      />

      <label>Meter Type:</label>
      <select
        value={type}
        onChange={(e) => setType(e.target.value as "prepaid" | "postpaid")}
        style={{ width: "100%", marginBottom: 10 }}
      >
        <option value="prepaid">Prepaid</option>
        <option value="postpaid">Postpaid</option>
      </select>

      {customerName && <p style={{ color: "green" }}>Customer Name: {customerName}</p>}

      <button
        onClick={handleVerifyMeter}
        disabled={loading}
        style={{ width: "100%", padding: 10, marginBottom: 10 }}
      >
        {loading ? "Verifying..." : "Verify Meter"}
      </button>

      <label>Amount (₦):</label>
      <input
        type="number"
        value={amount}
        onChange={(e) => setAmount(Number(e.target.value))}
        style={{ width: "100%", marginBottom: 10 }}
      />

      <label>Phone Number:</label>
      <input
        type="text"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        style={{ width: "100%", marginBottom: 20 }}
      />

      {message && <p style={{ color: verified ? "green" : "red" }}>{message}</p>}

      <button
        onClick={handlePurchase}
        disabled={loading || !verified}
        style={{ width: "100%", padding: 10 }}
      >
        {loading ? "Processing..." : "Pay & Get Token"}
      </button>
    </div>
  );
}
