// pages/electricity/success.tsx
import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";

interface ElectricityStatus {
  request_id: string;
  amount: number;
  status: string;
  customer_name?: string;
  token?: string;
  meter_number?: string;
  type?: "prepaid" | "postpaid";
}

export default function ElectricitySuccessPage() {
  const router = useRouter();
  const { reference } = router.query;

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [data, setData] = useState<ElectricityStatus | null>(null);

  useEffect(() => {
    if (!reference) return;

    const fetchTransaction = async () => {
      setLoading(true);
      setMessage("");
      try {
        // 1️⃣ Verify Paystack transaction
        const paystackRes = await axios.get(`/api/paystack/verify/${reference}`);
        const psData = paystackRes.data;

        if (psData.status !== "success") {
          setMessage("Payment not successful.");
          setLoading(false);
          return;
        }

        // 2️⃣ Retrieve request_id from Paystack metadata
        const request_id = psData.metadata?.request_id;
        if (!request_id) {
          setMessage("Invalid transaction metadata.");
          setLoading(false);
          return;
        }

        // 3️⃣ Check VTpass electricity transaction status
        const vtpassRes = await axios.post("/api/vtpass/electricity/status", { request_id });
        const vtData = vtpassRes.data;

        if (!vtData || vtData.error) {
          setMessage(vtData.error || "Failed to retrieve electricity status.");
          setLoading(false);
          return;
        }

        setData({
          request_id,
          amount: vtData.amount,
          status: vtData.response_description || vtData.status || "success",
          customer_name: vtData.customer_name,
          token: vtData.token, // For prepaid
          meter_number: vtData.billers_code,
          type: vtData.variation_code,
        });
      } catch (err: any) {
        console.error(err);
        setMessage(err.response?.data?.message || err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchTransaction();
  }, [reference]);

  if (loading) return <p style={{ padding: 20 }}>Loading transaction status...</p>;
  if (message) return <p style={{ padding: 20, color: "red" }}>{message}</p>;

  return (
    <div style={{ maxWidth: 500, margin: "auto", padding: 20 }}>
      <h1>Electricity Purchase Successful!</h1>

      <p>
        <strong>Meter Number:</strong> {data?.meter_number}
      </p>
      <p>
        <strong>Type:</strong> {data?.type}
      </p>
      <p>
        <strong>Amount:</strong> ₦{data?.amount}
      </p>
      <p>
        <strong>Status:</strong> {data?.status}
      </p>
      {data?.customer_name && (
        <p>
          <strong>Customer Name:</strong> {data.customer_name}
        </p>
      )}

      {data?.token && (
        <div style={{ marginTop: 20, padding: 10, background: "#f0f0f0", wordBreak: "break-all" }}>
          <h3>Prepaid Token:</h3>
          <p style={{ fontSize: 18, fontWeight: "bold" }}>{data.token}</p>
        </div>
      )}

      {!data?.token && data?.type === "postpaid" && (
        <p>Please pay your bill at the nearest outlet or via your electricity provider.</p>
      )}
    </div>
  );
}
