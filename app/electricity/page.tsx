"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";

interface Disco {
  code: string;
  name: string;
  label: string;
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

  // Fetch discos on mount
  useEffect(() => {
    axios.get("/api/vtpass/electricity/discos")
      .then(res => {
        setDiscos(res.data);
        if (res.data.length) setServiceID(res.data[0].code);
      })
      .catch(err => console.error("Failed to fetch discos:", err));
  }, []);

  const handleVerifyMeter = async () => {
    if (!serviceID || !billersCode) {
      setMessage("Please select a Disco and enter Meter Number");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const res = await axios.post("/api/vtpass/electricity/verify", { serviceID, billersCode, type });
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

      // Create electricity purchase request in backend
      await axios.post("/api/vtpass/electricity/purchase", {
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
      const callback_url = `${window.location.origin}/electricity/success?reference=${paystackRef}`;

      const ps = await axios.post("/api/paystack/initialize", {
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
