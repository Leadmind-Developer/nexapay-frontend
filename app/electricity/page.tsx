"use client";

import React, { useEffect, useState, useRef } from "react";
import api from "@/lib/api";
import BannersWrapper from "@/components/BannersWrapper";

/* ================= TYPES ================= */
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
    units?: string;
  };
}

/* ================= HELPERS ================= */
function normalizeReceipt(raw: any, fallback: Receipt): Receipt {
  if (!raw) return fallback;

  const token =
    raw.token ||
    raw.token_code ||
    (typeof raw.purchased_code === "string"
      ? raw.purchased_code.replace(/^Token\s*:\s*/i, "")
      : null) ||
    fallback.token;

  const units = raw.units || raw.powerUnits || fallback.vtpass?.units;

  let status: Receipt["status"] = "PROCESSING";

  if (token || units) status = "SUCCESS";
  else {
    const s = String(raw.status || raw.transactionStatus || "").toLowerCase();
    if (s.includes("fail") || s.includes("error")) status = "FAILED";
  }

  return {
    ...fallback,
    token,
    status,
    vtpass: { units },
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
  const [loading, setLoading] = useState(false);

  const pollRef = useRef<NodeJS.Timeout | null>(null);
  const requeryTriggered = useRef(false);

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
    if (!serviceId || !meterNumber) return setMessage("Enter meter number");

    setLoading(true);
    setMessage("");

    try {
      const res = await api.post("/vtpass/electricity/verify", {
        serviceId,
        meterNumber,
        type,
      });

      setVerification(res.data.details);
      setStage("review");
    } catch (e: any) {
      setMessage(e?.response?.data?.error || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  /* ================= POLL RECEIPT ================= */
  const pollReceipt = async (requestId: string) => {
    try {
      const res = await api.get(`/vtpass/electricity/receipt/${requestId}`);
      const raw = res.data?.receipt;

      setReceipt(prev => {
        if (!prev) return prev;

        const updated = normalizeReceipt(raw, prev);

        if (updated.status !== "PROCESSING") {
          clearTimeout(pollRef.current!);
          pollRef.current = null;
          setStage("receipt");
        }

        return updated;
      });

      if (!pollRef.current) {
        pollRef.current = setTimeout(() => pollReceipt(requestId), 5000);
      }
    } catch {
      pollRef.current = setTimeout(() => pollReceipt(requestId), 5000);
    }
  };

  /* ================= FRONTEND REQUERY ================= */
  const triggerFrontendRequery = async (requestId: string) => {
    if (requeryTriggered.current) return;
    requeryTriggered.current = true;

    try {
      await api.post(`/vtpass/electricity/requery/${requestId}`);
    } catch {
      // silent — scheduler + polling will still resolve it
    }
  };

  /* ================= CHECKOUT ================= */
  const handleCheckout = async () => {
    if (!verification || !amount || !phone) return;

    setStage("processing");
    setLoading(true);

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
      pollReceipt(base.requestId);

      // ⏱️ Frontend-triggered requery after 7s
      setTimeout(() => triggerFrontendRequery(base.requestId), 7000);
    } catch (e: any) {
      setStage("error");
      setMessage(e?.response?.data?.error || "Checkout failed");
    } finally {
      setLoading(false);
    }
  };

  /* ================= UI ================= */
  return (
    <BannersWrapper page="electricity">
      <div className="max-w-md mx-auto px-4 space-y-6">
        <Stepper stage={stage} />

        {stage === "verify" && (
          <Card title="Verify Meter">
            <select className="input" value={serviceId} onChange={e => setServiceId(e.target.value)}>
              {discos.map(d => (
                <option key={d.code} value={d.code}>{d.label}</option>
              ))}
            </select>

            <input className="input" placeholder="Meter Number" value={meterNumber} onChange={e => setMeterNumber(e.target.value)} />

            <select className="input" value={type} onChange={e => setType(e.target.value as any)}>
              <option value="prepaid">Prepaid</option>
              <option value="postpaid">Postpaid</option>
            </select>

            {message && <ErrorText>{message}</ErrorText>}

            <PrimaryButton disabled={loading} onClick={verifyMeter}>
              {loading ? <Spinner /> : "Verify Meter"}
            </PrimaryButton>
          </Card>
        )}

        {stage === "review" && verification && (
          <Card title="Review & Pay">
            <p className="font-semibold">{verification.customer_name}</p>
            <p className="text-sm text-gray-500">{verification.meter_number}</p>

            <input className="input" placeholder="Amount" type="number" value={amount} onChange={e => setAmount(e.target.value)} />
            <input className="input" placeholder="Phone" value={phone} onChange={e => setPhone(e.target.value)} />

            <PrimaryButton disabled={loading} onClick={handleCheckout}>
              {loading ? <Spinner /> : "Pay Now"}
            </PrimaryButton>
          </Card>
        )}

        {stage === "processing" && (
          <Card center title="Processing Payment">
            <Spinner />
            <p className="text-sm text-gray-500 mt-2">
              Completing transaction… checking for token
            </p>
          </Card>
        )}

        {stage === "receipt" && receipt && (
          <Card title="Electricity Receipt">
            <p><b>Status:</b> {receipt.status}</p>
            <p><b>Meter:</b> {receipt.meter_number}</p>
            <p><b>Amount:</b> ₦{receipt.amount}</p>

            {receipt.vtpass?.units && (
              <p><b>Units:</b> {receipt.vtpass.units} kWh</p>
            )}

            <div className="box text-center">
              <p className="font-semibold">Token</p>
              {receipt.token ? (
                <p className="font-mono tracking-widest">{receipt.token}</p>
              ) : (
                <Spinner />
              )}
            </div>

            <PrimaryButton onClick={() => window.location.reload()}>
              Buy Again
            </PrimaryButton>
          </Card>
        )}

        {stage === "error" && (
          <Card title="Error">
            <ErrorText>{message}</ErrorText>
          </Card>
        )}
      </div>
    </BannersWrapper>
  );
}

/* ================= UI HELPERS ================= */
const Card = ({ title, children, center }: any) => (
  <div className={`bg-white dark:bg-gray-900 rounded-lg p-5 shadow space-y-4 ${center ? "text-center" : ""}`}>
    <h2 className="font-semibold text-lg">{title}</h2>
    {children}
  </div>
);

const PrimaryButton = ({ children, ...p }: any) => (
  <button {...p} className="w-full bg-yellow-500 text-white py-3 rounded font-semibold disabled:opacity-60">
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
  const steps = ["verify", "review", "processing", "receipt"];
  return (
    <div className="flex justify-between text-xs text-gray-500">
      {steps.map(s => (
        <span key={s} className={stage === s ? "font-semibold text-yellow-600" : ""}>
          {s.toUpperCase()}
        </span>
      ))}
    </div>
  );
};
