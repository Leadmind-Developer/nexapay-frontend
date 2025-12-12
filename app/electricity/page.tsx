// pages/electricity/index.tsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";

interface Disco {
  code: string;
  name: string;
  label: string;
}

export default function ElectricityPurchasePage() {
  const [discos, setDiscos] = useState<Disco[]>([]);
  const [selectedDisco, setSelectedDisco] = useState("");
  const [meterNumber, setMeterNumber] = useState("");
  const [meterType, setMeterType] = useState<"prepaid" | "postpaid">("prepaid");
  const [customerName, setCustomerName] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    // Fetch available discos from backend
    const fetchDiscos = async () => {
      try {
        const res = await axios.get("/api/vtpass/electricity/discos");
        setDiscos(res.data);
        if (res.data.length > 0) setSelectedDisco(res.data[0].code);
      } catch (err) {
        console.error(err);
      }
    };
    fetchDiscos();
  }, []);

  const verifyMeter = async () => {
    if (!meterNumber || !selectedDisco) {
      setError("Please select a disco and enter meter number.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await axios.post("/api/vtpass/verify", {
        serviceID: selectedDisco,
        billersCode: meterNumber,
        type: meterType,
      });
      setCustomerName(res.data.customer_name || "");
      setVerified(true);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.error || "Failed to verify meter");
      setVerified(false);
      setCustomerName("");
    } finally {
      setLoading(false);
    }
  };

  const payWithCard = async () => {
    if (!verified) {
      setError("Please verify the meter first.");
      return;
    }
    if (!amount || Number(amount) <= 0) {
      setError("Please enter a valid amount.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const request_id = uuidv4(); // unique transaction id

      // Initialize VTpass purchase
      const vtpassPurchase = await axios.post("/api/vtpass/purchase", {
        request_id,
        serviceID: selectedDisco,
        billersCode: meterNumber,
        variation_code: meterType,
        amount,
        phone: "", // optional
      });

      // Initialize Paystack payment
      const paystackInit = await axios.post("/api/paystack/initialize", {
        amount: Number(amount), // Naira
        email: "customer@example.com", // You may allow user input
        reference: `ELEC-${request_id}`,
        metadata: {
          request_id, // VTpass request_id
        },
      });

      const authUrl = paystackInit.data.data.authorization_url;
      window.location.href = authUrl; // redirect to Paystack
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || "Payment initialization failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 500, margin: "auto", padding: 20 }}>
      <h1>Buy Electricity</h1>

      <div>
        <label>Disco:</label>
        <select
          value={selectedDisco}
          onChange={(e) => setSelectedDisco(e.target.value)}
        >
          {discos.map((d) => (
            <option key={d.code} value={d.code}>
              {d.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label>Meter Number:</label>
        <input
          type="text"
          value={meterNumber}
          onChange={(e) => setMeterNumber(e.target.value)}
        />
      </div>

      <div>
        <label>Meter Type:</label>
        <select
          value={meterType}
          onChange={(e) => setMeterType(e.target.value as "prepaid" | "postpaid")}
        >
          <option value="prepaid">Prepaid</option>
          <option value="postpaid">Postpaid</option>
        </select>
      </div>

      <button onClick={verifyMeter} disabled={loading}>
        {loading ? "Verifying..." : "Verify Meter"}
      </button>

      {verified && customerName && (
        <p>
          ✅ Customer Name: <strong>{customerName}</strong>
        </p>
      )}

      {verified && (
        <div style={{ marginTop: 20 }}>
          <label>Amount (₦):</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <button onClick={payWithCard} disabled={loading}>
            {loading ? "Processing..." : "Pay with Card"}
          </button>
        </div>
      )}

      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}
