"use client";

import React, { useEffect, useRef, useState } from "react";
import api from "@/lib/api";
import BannersWrapper from "@/components/BannersWrapper";

/* ================= TYPES ================= */
type Disco = { code: string; label: string };

type Stage =
  | "verify"
  | "review"
  | "processing"
  | "receipt"
  | "delayed"
  | "error";

type TransactionStatus = "SUCCESS" | "PROCESSING" | "FAILED";

interface MeterVerification {
  customer_name: string;
  meter_number: string;
  address?: string;
  tariffRate?: string;
}

interface Receipt {
  requestId: string;
  meter_number: string;
  customer_name: string;
  type: "prepaid" | "postpaid";
  amount: number;
  status: TransactionStatus;
  token: string | null;
  units?: string;
  createdAt: string;
}

/* ================= CONSTANTS ================= */
const POLL_INTERVAL = 5_000;
const MAX_PROCESSING_TIME = 10 * 60 * 1000; // 10 minutes

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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const pollTimer = useRef<NodeJS.Timeout | null>(null);

  /* ================= CLEANUP ================= */
  useEffect(() => {
    return () => {
      if (pollTimer.current) clearTimeout(pollTimer.current);
    };
  }, []);

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

  /* ================= VERIFY ================= */
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

      const baseReceipt: Receipt = {
        requestId: res.data.requestId,
        meter_number: verification.meter_number,
        customer_name: verification.customer_name,
        type,
        amount: Number(amount),
        status: "PROCESSING",
        token: null,
        createdAt: new Date().toISOString(),
      };

      setReceipt(baseReceipt);
      startPolling(baseReceipt.requestId, baseReceipt.createdAt);
    } catch (e: any) {
      setStage("error");
      setError(e?.response?.data?.error || "Payment failed");
    } finally {
      setLoading(false);
    }
  };

  /* ================= POLLING ================= */
  const startPolling = (requestId: string, createdAt: string) => {
    const poll = async () => {
      try {
        const res = await api.get(
          `/vtpass/electricity/receipt/${requestId}`
        );

        const data = res.data?.receipt;
        if (!data) throw new Error("No receipt");

        setReceipt((prev) => {
          if (!prev) return prev;

          const updated: Receipt = {
            ...prev,
            status: data.status,
            token: data.token ?? prev.token,
            units: data.vtpass?.units ?? prev.units,
          };

          if (updated.status === "SUCCESS") {
            clearTimeout(pollTimer.current!);
            pollTimer.current = null;
            setStage("receipt");
          }

          if (updated.status === "FAILED") {
            clearTimeout(pollTimer.current!);
            pollTimer.current = null;
            setStage("error");
            setError("Transaction failed");
          }

          return updated;
        });
      } catch {
        // silent — backend scheduler + next poll will resolve it
      }

      const age =
        Date.now() - new Date(createdAt).getTime();

      if (age > MAX_PROCESSING_TIME) {
        clearTimeout(pollTimer.current!);
        pollTimer.current = null;
        setStage("delayed");
        return;
      }

      pollTimer.current = setTimeout(poll, POLL_INTERVAL);
    };

    poll();
  };

  /* ================= UI ================= */
  return (
    <BannersWrapper page="electricity">
      <div className="max-w-md mx-auto px-4 space-y-6">
        <Stepper stage={stage} />

        {/* VERIFY */}
        {stage === "verify" && (
          <Card title="Verify Meter">
            <select
              className="input"
              value={serviceId}
              onChange={(e) => setServiceId(e.target.value)}
            >
              {discos.map((d) => (
                <option key={d.code} value={d.code}>
                  {d.label}
                </option>
              ))}
            </select>

            <input
              className="input"
              placeholder="Meter Number"
              value={meterNumber}
              onChange={(e) => setMeterNumber(e.target.value)}
            />

            <select
              className="input"
              value={type}
              onChange={(e) =>
                setType(e.target.value as any)
              }
            >
              <option value="prepaid">Prepaid</option>
              <option value="postpaid">Postpaid</option>
            </select>

            {error && <ErrorText>{error}</ErrorText>}

            <PrimaryButton disabled={loading} onClick={verifyMeter}>
              {loading ? <Spinner /> : "Verify Meter"}
            </PrimaryButton>
          </Card>
        )}

        {/* REVIEW */}
        {stage === "review" && verification && (
          <Card title="Review & Pay">
            <p className="font-semibold">
              {verification.customer_name}
            </p>
            <p className="text-sm text-gray-500">
              {verification.meter_number}
            </p>

            <input
              className="input"
              type="number"
              placeholder="Amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />

            <input
              className="input"
              placeholder="Phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />

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
              Completing transaction… checking for token
            </p>
          </Card>
        )}

        {/* DELAYED */}
        {stage === "delayed" && receipt && (
          <Card title="Taking Longer Than Expected">
            <p className="text-sm text-gray-600">
              This transaction is taking longer than expected.
            </p>

            <ul className="list-disc pl-4 text-sm mt-2">
              <li>
                Please check the Transactions page later for
                your token and receipt.
              </li>
              <li>
                If the token is not delivered after 10 minutes,
                contact support.
              </li>
            </ul>

            <a
              href="/support"
              className="text-yellow-600 font-semibold underline mt-3 inline-block"
            >
              Contact Support
            </a>
          </Card>
        )}

        {/* RECEIPT */}
        {stage === "receipt" && receipt && (
          <Card title="Electricity Receipt">
            <p>
              <b>Status:</b> {receipt.status}
            </p>
            <p>
              <b>Meter:</b> {receipt.meter_number}
            </p>
            <p>
              <b>Amount:</b> ₦{receipt.amount}
            </p>

            {receipt.units && (
              <p>
                <b>Units:</b> {receipt.units} kWh
              </p>
            )}

            <div className="box text-center">
              <p className="font-semibold">Token</p>
              <p className="font-mono tracking-widest">
                {receipt.token}
              </p>
            </div>

            <PrimaryButton
              onClick={() => window.location.reload()}
            >
              Buy Again
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
const Card = ({
  title,
  children,
  center,
}: any) => (
  <div
    className={`bg-white dark:bg-gray-900 rounded-lg p-5 shadow space-y-4 ${
      center ? "text-center" : ""
    }`}
  >
    <h2 className="font-semibold text-lg">{title}</h2>
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
  const steps = ["verify", "review", "processing", "receipt"];
  return (
    <div className="flex justify-between text-xs text-gray-500">
      {steps.map((s) => (
        <span
          key={s}
          className={
            stage === s
              ? "font-semibold text-yellow-600"
              : ""
          }
        >
          {s.toUpperCase()}
        </span>
      ))}
    </div>
  );
};
