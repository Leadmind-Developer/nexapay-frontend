"use client";

import React, { useEffect, useState, useRef } from "react";
import api from "@/lib/api";
import BannersWrapper from "@/components/BannersWrapper";

type Disco = { code: string; label: string };
type Stage = "verify" | "review" | "processing" | "receipt" | "error";

interface MeterVerification {
  customer_name: string;
  meter_number: string;
  address?: string;
  tariffRate?: string;
}

interface Receipt {
  requestId: string;
  meter_number: string;
  type: "prepaid" | "postpaid";
  customer_name: string;
  amount: number;
  token: string | null;
  status: "SUCCESS" | "PROCESSING" | "FAILED";
  vtpass?: {
    exchangeReference?: string;
    units?: string;
  };
}

/* ================= NORMALIZER ================= */
function normalizeVtpassReceipt(raw: any, fallback: Receipt): Receipt {
  if (!raw) return fallback;

  const content = raw.content || raw;
  const purchasedCode = content?.purchased_code || null;

  const token =
    content.token ||
    content.token_code ||
    (typeof purchasedCode === "string"
      ? purchasedCode.match(/(\d{10,})/)?.[1] || null
      : null) ||
    fallback.token ||
    null;

  const status: Receipt["status"] = token
    ? "SUCCESS"
    : raw?.code === "000"
    ? "PROCESSING"
    : "FAILED";

  return {
    ...fallback,
    status,
    token,
    customer_name: content.customerName || fallback.customer_name,
    meter_number: content.meterNumber || fallback.meter_number,
    amount: Number(content.amount) || fallback.amount,
    vtpass: {
      exchangeReference: content.exchangeReference || fallback.vtpass?.exchangeReference,
      units: content.units || fallback.vtpass?.units,
    },
  };
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
  const [message, setMessage] = useState("");
  const pollRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    api.get("/vtpass/electricity/discos")
      .then(r => {
        setDiscos(r.data || []);
        if (r.data?.length) setServiceId(r.data[0].code);
      })
      .catch(() => setMessage("Failed to load providers"));
  }, []);

  const verifyMeter = async () => {
    if (!serviceId || !meterNumber) return setMessage("Enter meter number");
    setMessage(""); setStage("verify");

    try {
      const res = await api.post("/vtpass/electricity/verify", { serviceId, meterNumber, type });
      if (res.data?.verified) {
        setVerification(res.data.details);
        setStage("review");
        return;
      }
      throw new Error("Verification failed");
    } catch (e: any) {
      setMessage(e?.response?.data?.error || e.message);
    }
  };

  const pollReceipt = async (requestId: string) => {
    try {
      const res = await api.get(`/vtpass/electricity/receipt/${requestId}`);
      const raw = res.data?.receipt;
      setReceipt(prev => normalizeVtpassReceipt(raw, prev!));

      if (receipt?.status === "PROCESSING") {
        pollRef.current = setTimeout(() => pollReceipt(requestId), 4000);
      } else {
        setStage("receipt");
      }
    } catch {
      pollRef.current = setTimeout(() => pollReceipt(requestId), 5000);
    }
  };

  const handleCheckout = async () => {
    if (!verification || !amount || !phone) return setMessage("Enter amount & phone");

    setStage("processing"); setMessage("");

    try {
      const res = await api.post("/vtpass/electricity/checkout", {
        serviceId, meterNumber, type, phone, amount: Number(amount),
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
      pollReceipt(base.requestId);
    } catch (e: any) {
      setStage("error");
      setMessage(e?.response?.data?.error || "Checkout failed");
    }
  };

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
            <PrimaryButton onClick={verifyMeter}>{message ? "Retry" : "Verify"}</PrimaryButton>
          </Card>
        )}

        {/* REVIEW */}
        {stage === "review" && verification && (
          <Card title="Review & Pay ⚡">
            <p><b>{verification.customer_name}</b></p>
            <p>{verification.meter_number}</p>
            <input type="number" value={amount} onChange={e => setAmount(e.target.value)} className="input" placeholder="Amount" />
            <input value={phone} onChange={e => setPhone(e.target.value)} className="input" placeholder="Phone" />
            <div className="flex gap-3">
              <SecondaryButton onClick={() => setStage("verify")}>Back</SecondaryButton>
              <PrimaryButton onClick={handleCheckout}>Pay</PrimaryButton>
            </div>
          </Card>
        )}

        {/* PROCESSING */}
        {stage === "processing" && <Card center title="Processing…"><Spinner /><p>Please wait</p></Card>}

        {/* RECEIPT */}
        {stage === "receipt" && receipt && (
          <Card title="Electricity Receipt ⚡">
            <p><b>Status:</b> {receipt.status}</p>
            <p><b>Customer:</b> {receipt.customer_name}</p>
            <p><b>Meter:</b> {receipt.meter_number}</p>
            <p><b>Amount:</b> ₦{receipt.amount}</p>
            <div className="box text-center">
              <p className="font-semibold">Token</p>
              {receipt.token ? <p className="font-mono tracking-widest">{receipt.token}</p> : <Spinner />}
            </div>
            <PrimaryButton onClick={() => window.location.reload()}>Buy Again</PrimaryButton>
          </Card>
        )}

        {stage === "error" && <Card title="Error"><ErrorText>{message}</ErrorText></Card>}
      </div>
    </BannersWrapper>
  );
}

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

const ErrorText = ({ children }: any) => <p className="text-sm text-red-600">{children}</p>;
const Spinner = () => <div className="flex justify-center"><div className="h-6 w-6 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin" /></div>;
