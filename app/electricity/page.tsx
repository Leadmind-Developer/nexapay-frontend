"use client";

import React, { useEffect, useState } from "react";
import api from "@/lib/api";
import BannersWrapper from "@/components/BannersWrapper";
import Link from "next/link";

/* ================= TYPES ================= */
type Disco = { code: string; label: string };

type Stage = "verify" | "review" | "processing" | "success" | "error";

interface MeterVerification {
  customer_name: string;
  meter_number: string;
}

interface Receipt {
  requestId: string;
  meter_number: string;
  customer_name: string;
  type: "prepaid" | "postpaid";
  amount: number;
  status: "SUCCESS" | "PROCESSING" | "FAILED";
}

/* ================= PAGE ================= */
export default function ElectricityPage() {
  const [discos, setDiscos] = useState<Disco[]>([]);
  const [serviceId, setServiceId] = useState("");
  const [meterNumber, setMeterNumber] = useState("");
  const [type, setType] = useState<"prepaid" | "postpaid">("prepaid");
  const [amount, setAmount] = useState("");
  const [phone, setPhone] = useState("");

  const [verification, setVerification] = useState<MeterVerification | null>(null);
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [stage, setStage] = useState<Stage>("verify");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /* ================= LOAD DISCOS ================= */
  useEffect(() => {
    api
      .get("/vtpass/electricity/discos")
      .then((res) => {
        setDiscos(res.data || []);
        if (res.data?.length) setServiceId(res.data[0].code);
      })
      .catch(() => setError("Failed to load electricity providers"));
  }, []);

  /* ================= VERIFY METER ================= */
  const verifyMeter = async () => {
    if (!serviceId || !meterNumber) {
      setError("Enter meter number");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const res = await api.post("/vtpass/electricity/verify", {
        serviceId,
        meterNumber,
        type,
      });

      setVerification(res.data.details);
      setStage("review");
    } catch (e: any) {
      setError(e?.response?.data?.error || "Meter verification failed");
    } finally {
      setLoading(false);
    }
  };

  /* ================= CHECKOUT ================= */
  const handleCheckout = async () => {
    if (!verification || !amount || !phone) return;

    setLoading(true);
    setStage("processing");
    setError("");

    try {
      const res = await api.post("/vtpass/electricity/checkout", {
        serviceId,
        meterNumber,
        type,
        phone,
        amount: Number(amount),
      });

      // Skip polling — just show success page
      const baseReceipt: Receipt = {
        requestId: res.data.requestId,
        meter_number: verification.meter_number,
        customer_name: verification.customer_name,
        type,
        amount: Number(amount),
        status: "SUCCESS",
      };

      setReceipt(baseReceipt);
      setStage("success");
    } catch (e: any) {
      setStage("error");
      setError(e?.response?.data?.error || "Payment failed");
    } finally {
      setLoading(false);
    }
  };

  /* ================= UI ================= */
  return (
    <BannersWrapper page="electricity">
      <div className="max-w-md mx-auto px-4 space-y-6">
        <Stepper stage={stage} />

        {/* VERIFY */}
        {stage === "verify" && (
          <Card title="Verify Meter">
            <div className="flex gap-2 mb-2">
              <select
                className="input flex-1"
                value={serviceId}
                onChange={(e) => setServiceId(e.target.value)}
              >
                {discos.map((d) => (
                  <option key={d.code} value={d.code}>
                    {d.label}
                  </option>
                ))}
              </select>
              <select
                className="input flex-1"
                value={type}
                onChange={(e) => setType(e.target.value as any)}
              >
                <option value="prepaid">Prepaid</option>
                <option value="postpaid">Postpaid</option>
              </select>
            </div>

            <input
              className="input mb-2"
              placeholder="Meter Number"
              value={meterNumber}
              onChange={(e) => setMeterNumber(e.target.value)}
            />

            {error && <ErrorText>{error}</ErrorText>}

            <PrimaryButton disabled={loading} onClick={verifyMeter}>
              {loading ? <Spinner /> : "Verify Meter"}
            </PrimaryButton>
          </Card>
        )}

        {/* REVIEW */}
        {stage === "review" && verification && (
          <Card title="Review & Pay">
            <p className="font-semibold">{verification.customer_name}</p>
            <p className="text-sm text-gray-500">{verification.meter_number}</p>

            <div className="flex gap-2 mb-2">
              <input
                className="input flex-1"
                type="number"
                placeholder="Amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
              <input
                className="input flex-1"
                placeholder="Phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            <PrimaryButton disabled={loading} onClick={handleCheckout}>
              {loading ? <Spinner /> : "Pay Now"}
            </PrimaryButton>
          </Card>
        )}

        {/* PROCESSING */}
        {stage === "processing" && (
          <Card center title="Processing Payment">
            <Spinner />
            <p className="text-sm text-gray-500 mt-2">
              Completing transaction… please wait
            </p>
          </Card>
        )}

        {/* SUCCESS */}
        {stage === "success" && receipt && (
          <Card title="Payment Successful">
            <p className="text-gray-700">
              Your payment of <b>₦{receipt.amount}</b> was successful.
            </p>
            <p className="text-gray-700">
              Check your <Link href="/transactions" className="text-yellow-600 underline font-semibold">Transactions page</Link> for your token and receipt.
            </p>

            <PrimaryButton onClick={() => window.location.reload()}>
              Make Another Payment
            </PrimaryButton>
          </Card>
        )}

        {/* ERROR */}
        {stage === "error" && (
          <Card title="Error">
            <ErrorText>{error}</ErrorText>
          </Card>
        )}
      </div>
    </BannersWrapper>
  );
}

/* ================= UI HELPERS ================= */
const Card = ({ title, children, center }: any) => (
  <div
    className={`bg-white dark:bg-gray-900 rounded-lg p-5 shadow space-y-4 ${
      center ? "text-center" : ""
    }`}
  >
    <h2 className="font-semibold text-lg mb-2">{title}</h2>
    {children}
  </div>
);

const PrimaryButton = ({ children, ...p }: any) => (
  <button
    {...p}
    className="w-full bg-yellow-500 text-white py-3 rounded font-semibold disabled:opacity-60"
  >
    {children}
  </button>
);

const ErrorText = ({ children }: any) => (
  <p className="text-sm text-red-600">{children}</p>
);

const Spinner = () => (
  <div className="flex justify-center">
    <div className="h-5 w-5 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin" />
  </div>
);

const Stepper = ({ stage }: { stage: Stage }) => {
  const steps = ["verify", "review", "processing", "success"];
  return (
    <div className="flex justify-between mb-4">
      {steps.map((s, i) => (
        <div key={s} className="flex-1 text-center relative">
          <div
            className={`h-2 w-full rounded-full ${
              stage === s || steps.indexOf(stage) > i
                ? "bg-yellow-500"
                : "bg-gray-300"
            }`}
          ></div>
          <span className="absolute -top-5 text-xs text-gray-500 font-semibold">
            {s.toUpperCase()}
          </span>
        </div>
      ))}
    </div>
  );
};
