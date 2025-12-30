"use client";

import React, { useEffect, useState } from "react";
import api from "@/lib/api";
import BannersWrapper from "@/components/BannersWrapper";

/* ================= TYPES ================= */
type Disco = { code: string; label: string };
type Stage = "verify" | "review" | "processing" | "receipt" | "error";

interface MeterVerification {
  customer_name: string;
  meter_number: string;
  address?: string;
  meterType?: string;
  accountType?: string;
  canVend?: string;
  tariffRate?: string;
}

interface Receipt {
  requestId: string;
  meter_number: string;
  type: "prepaid" | "postpaid";
  customer_name: string;
  amount: number;
  token?: string | null;
  status: "SUCCESS" | "PROCESSING" | "FAILED";
  vtpass?: {
    exchangeReference?: string;
    units?: string;
  };
}

/* ================= VTpass NORMALIZER ================= */
function normalizeVtpassReceipt(raw: any, fallback: Receipt): Receipt {
  if (!raw) return { ...fallback };

  // Safe extraction of VTpass content
  const vt = raw.vtpass || {};
  const content = {
    token: raw.token || raw.token_code || raw.purchased_code || vt.token || null,
    exchangeReference: vt.exchangeReference || raw.exchangeReference || null,
    units: vt.units || raw.units || null,
  };

  // Normalize status
  const rawStatus = String(raw.status || raw.transactionStatus || "").toLowerCase();
  const status: Receipt["status"] =
    ["successful", "delivered", "success"].includes(rawStatus)
      ? "SUCCESS"
      : ["failed", "error"].includes(rawStatus)
      ? "FAILED"
      : "PROCESSING";

  return {
    ...fallback,
    status,
    token: content.token,
    vtpass: {
      exchangeReference: content.exchangeReference,
      units: content.units,
    },
  };
}

/* ================= COUNTDOWN ================= */
const CountdownTimer = ({ seconds }: { seconds: number }) => {
  const [t, setT] = useState(seconds);

  useEffect(() => {
    if (t <= 0) return;
    const i = setInterval(() => setT(v => v - 1), 1000);
    return () => clearInterval(i);
  }, [t]);

  return <p className="text-xs text-gray-500">Checking again in {t}s…</p>;
};

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
  const [message, setMessage] = useState("");
  const [loadingVerify, setLoadingVerify] = useState(false);
  const [showMore, setShowMore] = useState(false);

  /* ================= LOAD DISCOS ================= */
  useEffect(() => {
    api.get("/vtpass/electricity/discos")
      .then(r => {
        setDiscos(r.data || []);
        if (r.data?.length) setServiceId(r.data[0].code);
      })
      .catch(() => setMessage("Failed to load providers"));
  }, []);

  /* ================= VERIFY ================= */
  const verifyMeter = async () => {
    if (!serviceId || !meterNumber) {
      return setMessage("Enter meter number");
    }

    setLoadingVerify(true);
    setMessage("");

    try {
      const res = await api.post("/vtpass/electricity/verify", {
        serviceId,
        meterNumber,
        type,
      });

      if (res.data?.verified) {
        setVerification(res.data.details);
        setStage("review");
        return;
      }

      throw new Error("Verification failed");
    } catch (e: any) {
      setMessage(e?.response?.data?.error || e.message);
    } finally {
      setLoadingVerify(false);
    }
  };

  /* ================= POLL RECEIPT ================= */
  const pollReceipt = async (requestId: string, base: Receipt) => {
    try {
      const res = await api.get(`/vtpass/electricity/receipt/${requestId}`);
      const normalized = normalizeVtpassReceipt(res.data.receipt, base);
      setReceipt(normalized);
      setStage("receipt");

      if (normalized.status === "PROCESSING") {
        setTimeout(() => pollReceipt(requestId, base), 4000);
      }
    } catch {
      setTimeout(() => pollReceipt(requestId, base), 5000);
    }
  };

  /* ================= CHECKOUT ================= */
  const handleCheckout = async () => {
    if (!verification) return;
    if (!amount || !phone) return setMessage("Enter amount & phone");

    setStage("processing");
    setMessage("");

    try {
      const res = await api.post("/vtpass/electricity/checkout", {
        serviceId,
        meterNumber,
        type,
        phone,
        amount: Number(amount),
      });

      const base: Receipt = {
        requestId: res.data.requestId,
        meter_number: verification.meter_number,
        customer_name: verification.customer_name,
        amount: Number(amount),
        type,
        status: "PROCESSING",
        token: null,
      };

      setReceipt(base);
      pollReceipt(base.requestId, base);
    } catch (e: any) {
      setStage("error");
      setMessage(e?.response?.data?.error || "Checkout failed");
    }
  };

  /* ================= UI ================= */
  return (
    <BannersWrapper page="electricity">
      <div className="max-w-md mx-auto px-4 space-y-4">

        {/* VERIFY */}
        {stage === "verify" && (
          <Card title="Verify Meter">
            <select value={serviceId} onChange={e => setServiceId(e.target.value)} className="input">
              {discos.map(d => <option key={d.code} value={d.code}>{d.label}</option>)}
            </select>

            <input value={meterNumber} onChange={e => setMeterNumber(e.target.value)} className="input" placeholder="Meter Number" />

            <select value={type} onChange={e => setType(e.target.value as any)} className="input">
              <option value="prepaid">Prepaid</option>
              <option value="postpaid">Postpaid</option>
            </select>

            {message && <ErrorText>{message}</ErrorText>}

            <PrimaryButton onClick={verifyMeter}>
              {loadingVerify ? "Verifying…" : "Verify"}
            </PrimaryButton>
          </Card>
        )}

        {/* REVIEW */}
        {stage === "review" && verification && (
          <Card title="Review & Pay ⚡">
            <p><b>{verification.customer_name}</b></p>
            <p>{verification.meter_number}</p>

            <button onClick={() => setShowMore(v => !v)} className="link">
              {showMore ? "Hide details ▲" : "More details ▼"}
            </button>

            {showMore && (
              <div className="box">
                <p>Address: {verification.address || "-"}</p>
                <p>Tariff: {verification.tariffRate || "-"}</p>
              </div>
            )}

            <input type="number" value={amount} onChange={e => setAmount(e.target.value)} className="input" placeholder="Amount" />
            <input value={phone} onChange={e => setPhone(e.target.value)} className="input" placeholder="Phone" />

            <div className="flex gap-3">
              <SecondaryButton onClick={() => setStage("verify")}>Back</SecondaryButton>
              <PrimaryButton onClick={handleCheckout}>Pay</PrimaryButton>
            </div>
          </Card>
        )}

        {/* PROCESSING */}
        {stage === "processing" && (
          <Card center title="Processing…">
            <Spinner />
            <p className="text-sm text-gray-500">Please wait</p>
          </Card>
        )}

        {/* RECEIPT */}
        {stage === "receipt" && receipt && (
          <Card title="Electricity Receipt ⚡">
            <p><b>Status:</b> {receipt.status}</p>
            <p><b>Customer:</b> {receipt.customer_name}</p>
            <p><b>Meter:</b> {receipt.meter_number}</p>
            <p><b>Amount:</b> ₦{receipt.amount}</p>

            <div className="box text-center">
              <p className="font-semibold">Token</p>
              {receipt.token ? (
                <p className="font-mono tracking-widest">{receipt.token}</p>
              ) : (
                <>
                  <Spinner />
                  <CountdownTimer seconds={30} />
                </>
              )}
            </div>

            <PrimaryButton onClick={() => window.location.reload()}>
              Buy Again
            </PrimaryButton>
          </Card>
        )}

        {/* ERROR */}
        {stage === "error" && (
          <Card title="Something went wrong">
            <ErrorText>{message}</ErrorText>
          </Card>
        )}

      </div>
    </BannersWrapper>
  );
}

/* ================= UI HELPERS ================= */
const Card = ({ title, children, center }: any) => (
  <div className={`bg-white dark:bg-gray-900 border rounded p-5 space-y-4 shadow ${center && "text-center"}`}>
    <h2 className="font-bold text-lg">{title}</h2>
    {children}
  </div>
);

const PrimaryButton = ({ children, ...p }: any) => (
  <button {...p} className="w-full bg-yellow-500 text-white py-3 rounded font-semibold">{children}</button>
);

const SecondaryButton = ({ children, ...p }: any) => (
  <button {...p} className="w-full bg-gray-200 dark:bg-gray-700 py-3 rounded">{children}</button>
);

const ErrorText = ({ children }: any) => (
  <p className="text-sm text-red-600">{children}</p>
);

const Spinner = () => (
  <div className="flex justify-center">
    <div className="h-6 w-6 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin" />
  </div>
);
