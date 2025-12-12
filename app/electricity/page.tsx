// pages/electricity.tsx
import React, { useState, useEffect } from "react";
import { VTPassAPI } from "../lib/api";
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

  useEffect(() => {
    // Fetch discos from backend
    axios.get("/api/vtpass/electricity/discos").then((res) => {
      setDiscos(res.data);
      if (res.data.length) setServiceID(res.data[0].code);
    });
  }, []);

  const handlePurchase = async () => {
    if (!serviceID || !billersCode || !amount || !phone) {
      setMessage("Please fill all fields");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      // Generate a unique request_id for this transaction
      const request_id = uuidv4();

      // Call VTpass purchase endpoint
      const purchaseRes = await axios.post("/api/vtpass/electricity/purchase", {
        request_id,
        serviceID,
        billersCode,
        variation_code: type,
        amount,
        phone,
      });

      // Prepare Paystack payment
      const paystackRef = `ELEC-${Date.now()}`;
      const email = `${phone}@nexapay.fake`; // For guest users, we can make a dummy email
      const callback_url = `${window.location.origin}/electricity/success?reference=${paystackRef}`;

      const ps = await axios.post("/api/paystack/initialize", {
        amount, // Naira
        email,
        reference: paystackRef,
        callback_url,
        metadata: {
          request_id,
          purpose: "electricity_purchase",
        },
      });

      const { authorization_url } = ps.data.data;
      // Redirect user to Paystack payment page
      window.location.href = authorization_url;
    } catch (err: any) {
      console.error("Purchase failed:", err.response?.data || err.message);
      setMessage(
        err.response?.data?.message ||
          err.message ||
          "Failed to initiate electricity purchase"
      );
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
          <option key={d.code} value={d.code}>
            {d.label}
          </option>
        ))}
      </select>

      <label>Meter Number:</label>
      <input
        type="text"
        value={billersCode}
        onChange={(e) => setBillersCode(e.target.value)}
        style={{ width: "100%", marginBottom: 10 }}
      />

      <label>Meter Type:</label>
      <select
        value={type}
        onChange={(e) => setType(e.target.value as any)}
        style={{ width: "100%", marginBottom: 10 }}
      >
        <option value="prepaid">Prepaid</option>
        <option value="postpaid">Postpaid</option>
      </select>

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

      {message && <p style={{ color: "red" }}>{message}</p>}

      <button
        onClick={handlePurchase}
        disabled={loading}
        style={{ width: "100%", padding: 10 }}
      >
        {loading ? "Processing..." : "Pay & Get Token"}
      </button>
    </div>
  );
}
