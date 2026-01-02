"use client";

import { useEffect, useMemo, useState } from "react";
import api from "@/lib/api";

type Props = {
  onClose: () => void;
  onCreated: (goal: any) => void;
};

type FundingSource = "MANUAL" | "AUTO" | "";

type DailyDraft = {
  targetAmount: number;
  startDate: string;
  primarySource: FundingSource;
  vaAccount?: string;
  vaBank?: string;
};

export default function SavingsDailyCreateModal({ onClose, onCreated }: Props) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [toastVisible, setToastVisible] = useState(false);

  /* ---------------- Local input buffer (NO re-render storm) ---------------- */
  const [amountInput, setAmountInput] = useState("");

  /* ---------------- Draft (committed values only) ---------------- */
  const [draft, setDraft] = useState<DailyDraft>({
    targetAmount: 0,
    startDate: new Date().toISOString().split("T")[0],
    primarySource: "",
  });

  /* ---------------- Virtual account state ---------------- */
  const [vaLoading, setVaLoading] = useState(false);
  const [vaExists, setVaExists] = useState(false);

  /* ---------------- Derived values (memoized) ---------------- */
  const dailyAmount = useMemo(() => {
    if (draft.targetAmount <= 0) return 0;
    return Math.round(draft.targetAmount / 30);
  }, [draft.targetAmount]);

  /* ---------------- VA check (MANUAL only, stable) ---------------- */
  useEffect(() => {
    if (draft.primarySource !== "MANUAL") return;

    let cancelled = false;

    const fetchVA = async () => {
      setVaLoading(true);
      try {
        const res = await api.get("/wallet/me");
if (res.data.success) {
  const va = res.data.virtualAccount;
  if (va?.accountNumber) {
    setVaExists(true);
    setDraft((d) => ({
      ...d,
      vaAccount: va.accountNumber,
      vaBank: va.bankName,
    }));
  } else {
    setVaExists(false);
  }
}

        if (cancelled) return;

        const va = res.data?.virtualAccount;
        if (va?.accountNumber) {
          setVaExists(true);
          setDraft((d) => ({
            ...d,
            vaAccount: va.accountNumber,
            vaBank: va.bankName,
          }));
        } else {
          setVaExists(false);
        }
      } catch {
        if (!cancelled) setVaExists(false);
      } finally {
        if (!cancelled) setVaLoading(false);
      }
    };

    fetchVA();
    return () => {
      cancelled = true;
    };
  }, [draft.primarySource]);

  /* ---------------- Step transitions ---------------- */
  const goToStep2 = () => {
    const amount = Number(amountInput);
    if (!amount || amount <= 0) return;

    setDraft((d) => ({
      ...d,
      targetAmount: amount,
    }));
    setStep(2);
  };

  const goToStep3 = () => {
    if (!draft.primarySource) return;
    setStep(3);
  };

  /* ---------------- Submit ---------------- */
  const submit = async () => {
    if (!draft.primarySource || draft.targetAmount <= 0) return;

    try {
      const res = await api.post("/strict-daily", {
        targetAmount: draft.targetAmount,
        startDate: draft.startDate,
        primarySource: draft.primarySource,
        vaAccount: draft.primarySource === "MANUAL" ? draft.vaAccount : undefined,
        vaBank: draft.primarySource === "MANUAL" ? draft.vaBank : undefined,
        durationDays: 30,
        frequency: "daily",
        planType: "STRICT_DAILY",
      });

      const goal = res.data?.data;
      if (!goal) throw new Error("No plan returned");

      if (draft.primarySource === "AUTO") {
        await api.post("/wallet/transfer", {
          toUserId: goal.userId,
          amount: Number(draft.targetAmount)          
        });
      }

      onCreated(goal);
      setToastVisible(true);

      setTimeout(() => {
        setToastVisible(false);
        onClose();
      }, 1800);
    } catch (err) {
      console.error(err);
      alert("Failed to create savings plan. Please try again.");
    }
  };

  /* ---------------- UI helpers ---------------- */
  const Step = ({ children }: { children: React.ReactNode }) => (
    <div className="animate-in fade-in slide-in-from-right-5 duration-300 space-y-6">
      {children}
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-zinc-900 w-full max-w-lg rounded-xl p-6 relative">

        {toastVisible && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg">
            Savings Goal Created Successfully!
          </div>
        )}

        {/* ---------------- STEP 1 ---------------- */}
        {step === 1 && (
          <Step>
            <h2 className="text-lg font-semibold">Strict Daily Contributions</h2>

            <input
              type="number"
              placeholder="Total amount (₦)"
              className="input w-full"
              value={amountInput}
              onChange={(e) => setAmountInput(e.target.value)}
            />

            <label className="text-sm text-gray-500">Start Date</label>
            <input
              type="date"
              className="input w-full"
              value={draft.startDate}
              onChange={(e) =>
                setDraft((d) => ({ ...d, startDate: e.target.value }))
              }
            />

            {Number(amountInput) > 0 && (
              <p className="text-sm text-gray-500">
                ₦{Math.round(Number(amountInput) / 30).toLocaleString()} per day
              </p>
            )}

            <div className="flex gap-3">
              <button onClick={onClose} className="btn-secondary w-full">
                Cancel
              </button>
              <button
                disabled={!Number(amountInput)}
                onClick={goToStep2}
                className="btn-primary w-full"
              >
                Continue
              </button>
            </div>
          </Step>
        )}

        {/* ---------------- STEP 2 ---------------- */}
        {step === 2 && (
          <Step>
            <h2 className="text-lg font-semibold">Funding Source</h2>

            <select
              className="input w-full"
              value={draft.primarySource}
              onChange={(e) =>
                setDraft((d) => ({
                  ...d,
                  primarySource: e.target.value as FundingSource,
                }))
              }
            >
              <option value="">Select source</option>
              <option value="MANUAL">Manual Bank Transfer</option>
              <option value="AUTO">Wallet Debit (Auto)</option>
            </select>

            {draft.primarySource === "MANUAL" && (
              <div className="text-sm">
                {vaLoading && <p>Checking virtual account…</p>}
                {!vaLoading && vaExists && (
                  <p className="text-green-600">
                    VA: {draft.vaAccount} ({draft.vaBank})
                  </p>
                )}
                {!vaLoading && !vaExists && (
                  <p className="text-red-500">
                    Virtual account will be created
                  </p>
                )}
              </div>
            )}

            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="btn-secondary w-full">
                Back
              </button>
              <button
                disabled={!draft.primarySource}
                onClick={goToStep3}
                className="btn-primary w-full"
              >
                Continue
              </button>
            </div>
          </Step>
        )}

        {/* ---------------- STEP 3 ---------------- */}
        {step === 3 && (
          <Step>
            <h2 className="text-lg font-semibold">Review</h2>

            <div className="text-sm space-y-1">
              <p><b>Total:</b> ₦{draft.targetAmount.toLocaleString()}</p>
              <p><b>Daily:</b> ₦{dailyAmount.toLocaleString()}</p>
              <p><b>Start:</b> {draft.startDate}</p>
              <p>
                <b>Source:</b>{" "}
                {draft.primarySource === "AUTO"
                  ? "Wallet Debit"
                  : "Manual Transfer"}
              </p>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep(2)} className="btn-secondary w-full">
                Back
              </button>
              <button onClick={submit} className="btn-primary w-full">
                Confirm & Save
              </button>
            </div>
          </Step>
        )}
      </div>
    </div>
  );
}
