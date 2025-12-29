"use client";

import React, { useEffect, useState } from "react";
import api from "@/lib/api";
import BannersWrapper from "@/components/BannersWrapper";

/* ================= TYPES ================= */
type Disco = { code: string; label: string };
type Stage = "verify" | "review" | "processing" | "success" | "error";

interface MeterVerification {
  customer_name: string;
  meter_number: string;
  address?: string;
  meterType?: string;
  accountType?: string;
  canVend?: string;
  tariffRate?: string;
  phone?: string;
  email?: string;
}

interface Receipt {
  requestId: string;
  meter_number: string;
  type: "prepaid" | "postpaid";
  customer_name: string;
  amount: number;
  token?: string | null;
  status: "SUCCESS" | "PROCESSING" | "FAILED";
  vtpass?: any;
}

/* ================= PAGE ================= */
export default function ElectricityPage() {
  const [discos, setDiscos] = useState<Disco[]>([]);
  const [serviceId, setServiceId] = useState("");
  const [meterNumber, setMeterNumber] = useState("");
  const [type, setType] = useState<"prepaid" | "postpaid">("prepaid");
  const [amount, setAmount] = useState("");
  const [phone, setPhone] = useState("");

  const [verification, setVerification] =
    useState<MeterVerification | null>(null);

  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [stage, setStage] = useState<Stage>("verify");
  const [message, setMessage] = useState("");
  const [loadingVerify, setLoadingVerify] = useState(false);
  const [showMore, setShowMore] = useState(false);

  /* ================= LOAD DISCOS ================= */
  useEffect(() => {
    api
      .get<Disco[]>("/vtpass/electricity/discos")
      .then(res => {
        setDiscos(res.data || []);
        if (res.data?.length) setServiceId(res.data[0].code);
      })
      .catch(() => setMessage("Failed to load electricity providers"));
  }, []);

  /* ================= VERIFY METER ================= */
  const verifyMeter = async () => {
    if (!serviceId || !meterNumber) {
      return setMessage("Enter meter number & select Disco");
    }

    setMessage("");
    setVerification(null);
    setLoadingVerify(true);

    try {
      const res = await api.post("/vtpass/electricity/verify", {
        serviceId,
        meterNumber,
        type,
      });

      if (res.data?.success && res.data?.verified && res.data?.details) {
        setVerification(res.data.details);
        setStage("review");
        return;
      }

      throw new Error("Unable to verify meter");
    } catch (err: any) {
      setMessage(
        err?.response?.data?.error || err?.message || "Verification failed"
      );
    } finally {
      setLoadingVerify(false);
    }
  };

  /* ================= CHECKOUT ================= */
  const handleCheckout = async () => {
    if (!verification) return setMessage("Verify meter first");
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
      const status = res.data?.status || "PROCESSING";

      setReceipt({
        requestId: res.data.requestId,
        meter_number: verification.meter_number,
        type,
        customer_name: verification.customer_name,
        amount: Number(amount),
        token: vtpass?.token || vtpass?.token_code || null,
        status,
        vtpass,
      });

      setStage(
        transactionStatus === "FAILED" ? "error" :
        transactionStatus === "SUCCESS" || transactionStatus === "DELIVERED" ? "success" :
        "processing"
      );
    } catch (err: any) {
      setMessage(
        err?.response?.data?.error || err?.message || "Checkout failed"
      );
      setStage("error");
    }
  };

  /* ================= UI ================= */
  return (
    <BannersWrapper page="electricity">
      <div className="max-w-md mx-auto px-4 space-y-4 text-gray-900 dark:text-gray-100">

        {/* ================= VERIFY ================= */}
        {stage === "verify" && (
          <div className="bg-white dark:bg-gray-900 border dark:border-gray-800 rounded-lg p-5 space-y-4 shadow">
            <h2 className="text-lg font-bold">Verify Meter</h2>

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
              onChange={e => setType(e.target.value as any)}
              className="w-full p-3 border rounded dark:bg-gray-900 dark:border-gray-700"
            >
              <option value="prepaid">Prepaid</option>
              <option value="postpaid">Postpaid</option>
            </select>

            {message && <p className="text-red-600 text-sm">{message}</p>}

            <button
              onClick={verifyMeter}
              disabled={loadingVerify}
              className="w-full bg-yellow-500 text-white py-3 rounded font-semibold"
            >
              {loadingVerify ? "Verifying…" : "Verify Meter"}
            </button>

            {/* Skeleton Loader */}
            {loadingVerify && (
              <div className="space-y-3 animate-pulse">
                <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded" />
                <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-5/6" />
                <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-2/3" />
              </div>
            )}
          </div>
        )}

        {/* ================= REVIEW + PAYMENT ================= */}
        {stage === "review" && verification && (
          <div className="bg-white dark:bg-gray-900 border dark:border-gray-800 rounded-lg p-5 shadow space-y-4">
            <h2 className="text-lg font-bold">Review & Pay ⚡</h2>

            {/* Core Info */}
            <div className="space-y-1 text-sm">
              <p><b>Customer:</b> {verification.customer_name}</p>
              <p><b>Meter:</b> {verification.meter_number}</p>
            </div>

            {/* Collapsible */}
            <button
              onClick={() => setShowMore(v => !v)}
              className="text-yellow-600 text-sm font-medium"
            >
              {showMore ? "Hide details ▲" : "More details ▼"}
            </button>

            {showMore && (
              <div className="border rounded p-3 text-sm space-y-1">
                <p><b>Address:</b> {verification.address || "-"}</p>
                <p><b>Meter Type:</b> {verification.meterType || "-"}</p>
                <p><b>Account Type:</b> {verification.accountType || "-"}</p>
                <p><b>Can Vend:</b> {verification.canVend || "-"}</p>
                <p><b>Tariff (₦/kWh):</b> {verification.tariffRate || "-"}</p>
              </div>
            )}

            {/* Payment */}
            <div className="space-y-3">
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
              {message && <p className="text-red-600 text-sm">{message}</p>}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStage("verify")}
                className="flex-1 bg-gray-200 dark:bg-gray-700 py-3 rounded"
              >
                Back
              </button>
              <button
                onClick={handleCheckout}
                className="flex-1 bg-yellow-500 text-white py-3 rounded font-semibold"
              >
                Pay
              </button>
            </div>
          </div>
        )}

        {/* ================= PROCESSING ================= */}
        {stage === "processing" && (
          <div className="bg-white dark:bg-gray-900 border dark:border-gray-800 rounded-lg p-6 text-center shadow">
            Processing your electricity purchase…
          </div>
        )}

        {/* ================= SUCCESS ================= */}
{stage === "success" && receipt && (
  <div className="bg-green-100 dark:bg-green-900 border dark:border-green-800 p-6 rounded text-center space-y-3">
    <h2 className="text-lg font-bold">
      {receipt.status === "SUCCESS"
        ? "Purchase Successful ⚡"
        : "Purchase Processing ⚡"}
      </h2>
    <p><b>Customer:</b> {receipt.customer_name}</p>
    <p><b>Meter:</b> {receipt.meter_number}</p>
    <p><b>Amount:</b> ₦{receipt.amount}</p>
    <p><b>Token:</b> {receipt.token || "Processing…"}</p>
    <p><b>VTpass Ref:</b> {receipt.vtpass?.exchangeReference || "N/A"}</p>
    <p><b>Units:</b> {receipt.vtpass?.units || "N/A"}</p>
    <pre className="text-left font-mono text-xs overflow-x-auto">
      {JSON.stringify(receipt.vtpass, null, 2)}
      </pre>
    <button
      onClick={() => window.location.reload()}
      className="w-full bg-green-600 text-white py-3 rounded font-semibold"
    >
      Buy Again
    </button>
  </div>
)}

        {/* ================= ERROR ================= */}
        {stage === "error" && (
          <div className="bg-red-100 dark:bg-red-900 border dark:border-red-800 p-6 rounded text-center space-y-3">
            <h2 className="text-lg font-bold">Something went wrong</h2>
            <p className="text-sm">{message}</p>
          </div>
        )}

      </div>
    </BannersWrapper>
  );
}
