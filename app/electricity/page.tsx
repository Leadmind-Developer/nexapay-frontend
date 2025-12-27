"use client";

import React, { useEffect, useState } from "react";
import api from "@/lib/api";
import BannersWrapper from "@/components/BannersWrapper";

/* ================= TYPES ================= */
type Disco = { code: string; label: string };
type Stage = "verify" | "payment" | "processing" | "success" | "error";

interface Receipt {
  requestId: string;
  meter_number: string;
  type: "prepaid" | "postpaid";
  customer_name: string;
  amount: number;
  token?: string;
}

/* ================= PAGE ================= */
export default function ElectricityPage() {
  const [discos, setDiscos] = useState<Disco[]>([]);
  const [serviceId, setServiceId] = useState("");
  const [meterNumber, setMeterNumber] = useState("");
  const [type, setType] = useState<"prepaid" | "postpaid">("prepaid");
  const [amount, setAmount] = useState("");
  const [phone, setPhone] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [stage, setStage] = useState<Stage>("verify");
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [message, setMessage] = useState("");

  /* ================= LOAD DISCOS ================= */
  useEffect(() => {
    api
      .get<Disco[]>("/vtpass/electricity/verify")
      .then(res => {
        setDiscos(res.data || []);
        if (res.data?.length) setServiceId(res.data[0].code);
      })
      .catch(() => setMessage("Failed to load electricity providers"));
  }, []);

  /* ================= VERIFY METER ================= */
  const verifyMeter = async () => {
    if (!serviceId || !meterNumber) return setMessage("Enter meter number & select Disco");
    setMessage("");
    setCustomerName("");

    try {
      const res = await api.post("/vtpass/electricity/verify", {
        serviceId,
        meterNumber,
        type,
      });

      if (res.data?.customer_name) {
        setCustomerName(res.data.customer_name);
        setStage("payment");
        return;
      }

      throw new Error("Unable to verify meter");
    } catch (err: any) {
      const error = err?.response?.data?.error || err?.message || "Verification failed";
      setMessage(error);

      // Already verified
      if (error.toLowerCase().includes("already verified")) {
        setCustomerName(err?.response?.data?.customer_name || meterNumber);
        setStage("payment");
      }
    }
  };

  /* ================= CHECKOUT ================= */
  const handleCheckout = async () => {
    if (!customerName) return setMessage("Verify meter first");
    if (!amount || !phone) return setMessage("Enter amount and phone number");

    setStage("processing");
    setMessage("");

    try {
      const res = await api.post("/vtpass/electricity/checkout", {
        serviceId,
        meterNumber,
        amount: Number(amount),
        type,
        phone,
      });

      const vtpass = res.data?.vtpass;
      setReceipt({
        requestId: res.data?.requestId,
        meter_number: meterNumber,
        type,
        customer_name: customerName,
        amount: Number(amount),
        token: vtpass?.token || vtpass?.token_code,
      });

      setStage("success");
    } catch (err: any) {
      const error = err?.response?.data?.error || err?.message || "Checkout failed";
      setMessage(error);
      setStage("error");
    }
  };

  /* ================= UI ================= */
  return (
    <BannersWrapper page="electricity">
      <div className="max-w-md mx-auto px-4 space-y-4 text-gray-900 dark:text-gray-100">

        {/* VERIFY */}
        {stage === "verify" && (
          <div className="bg-white dark:bg-gray-900 border dark:border-gray-800 rounded-lg p-6 space-y-4 shadow">
            <h2 className="text-xl font-bold">Verify Meter</h2>
            <select
              value={serviceId}
              onChange={e => setServiceId(e.target.value)}
              className="w-full p-3 border rounded dark:bg-gray-900 dark:border-gray-700"
            >
              {discos.map(d => (
                <option key={d.code} value={d.code}>{d.label}</option>
              ))}
            </select>
            <input
              value={meterNumber}
              onChange={e => setMeterNumber(e.target.value)}
              placeholder="Meter Number"
              className="w-full p-3 border rounded dark:bg-gray-900 dark:border-gray-700"
            />
            <select
              value={type}
              onChange={e => setType(e.target.value as "prepaid" | "postpaid")}
              className="w-full p-3 border rounded dark:bg-gray-900 dark:border-gray-700"
            >
              <option value="prepaid">Prepaid</option>
              <option value="postpaid">Postpaid</option>
            </select>
            {message && <p className="text-red-600 font-medium">{message}</p>}
            <button
              onClick={verifyMeter}
              className="w-full bg-yellow-500 text-white py-3 rounded font-semibold"
            >
              Verify Meter
            </button>
          </div>
        )}

        {/* PAYMENT */}
        {stage === "payment" && (
          <div className="bg-white dark:bg-gray-900 border dark:border-gray-800 rounded-lg p-6 space-y-4 shadow">
            <h2 className="text-xl font-bold">Payment</h2>
            <p className="text-sm"><b>Customer:</b> {customerName}</p>
            <input
              type="number"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="Amount"
              className="w-full p-3 border rounded dark:bg-gray-900 dark:border-gray-700"
            />
            <input
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="Phone Number"
              className="w-full p-3 border rounded dark:bg-gray-900 dark:border-gray-700"
            />
            {message && <p className="text-red-600 font-medium">{message}</p>}
            <div className="flex gap-3">
              <button onClick={() => setStage("verify")} className="flex-1 bg-gray-200 dark:bg-gray-700 py-3 rounded">Back</button>
              <button onClick={handleCheckout} className="flex-1 bg-yellow-500 text-white py-3 rounded font-semibold">Pay & Get Token</button>
            </div>
          </div>
        )}

        {/* PROCESSING */}
        {stage === "processing" && (
          <div className="bg-white dark:bg-gray-900 border dark:border-gray-800 rounded-lg p-6 text-center shadow">
            Processing your electricity purchase…
          </div>
        )}

        {/* SUCCESS */}
        {stage === "success" && receipt && (
          <div className="bg-green-100 dark:bg-green-900 border dark:border-green-800 p-6 rounded text-center space-y-3">
            <h2 className="text-xl font-bold">Purchase Successful ⚡</h2>
            <p><b>Meter:</b> {receipt.meter_number}</p>
            <p><b>Type:</b> {receipt.type}</p>
            <p><b>Amount:</b> ₦{receipt.amount}</p>
            <p><b>Customer:</b> {receipt.customer_name}</p>
            {receipt.token && (
              <div className="bg-white/80 dark:bg-black/30 p-3 rounded mt-2">
                <p className="font-semibold">Token</p>
                <p className="font-mono text-lg tracking-wider">{receipt.token}</p>
              </div>
            )}
            <button
              onClick={() => {
                setStage("verify");
                setMeterNumber("");
                setAmount("");
                setPhone("");
                setCustomerName("");
                setReceipt(null);
                setMessage("");
              }}
              className="w-full bg-green-600 text-white py-3 rounded font-semibold"
            >
              Buy Again
            </button>
          </div>
        )}

        {/* ERROR */}
        {stage === "error" && (
          <div className="bg-red-100 dark:bg-red-900 border dark:border-red-800 p-6 rounded text-center space-y-3">
            <h2 className="text-lg font-bold">Something went wrong</h2>
            <p className="text-sm">{message}</p>
            <a href="/contact" className="inline-block bg-yellow-500 text-white py-3 px-4 rounded w-full">
              Contact Support
            </a>
          </div>
        )}

      </div>
    </BannersWrapper>
  );
}
