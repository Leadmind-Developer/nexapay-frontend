"use client";

import { useEffect, useMemo, useState } from "react";
import api from "@/lib/api";

type Props = {
  onClose: () => void;
  onCreated: () => void;
};

type FundingSource = "MANUAL" | "AUTO" | "";

type DailyDraft = {
  targetAmount: number;
  startDate: string;
  primarySource: FundingSource;
  vaAccount?: string;
  vaBank?: string;
};

export default function SavingsDailyCreateModal({
  onClose,
  onCreated,
}: Props) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [submitting, setSubmitting] = useState(false);

  /* ---------------- Input buffer ---------------- */
  const [amountInput, setAmountInput] = useState("");

  /* ---------------- Draft ---------------- */
  const [draft, setDraft] = useState<DailyDraft>({
    targetAmount: 0,
    startDate: new Date().toISOString().split("T")[0],
    primarySource: "",
  });

  /* ---------------- Virtual Account ---------------- */
  const [vaLoading, setVaLoading] = useState(false);
  const [vaExists, setVaExists] = useState(false);

  /* ---------------- Derived ---------------- */
  const dailyAmount = useMemo(() => {
    if (!draft.targetAmount) return 0;
    return Math.round(draft.targetAmount / 30);
  }, [draft.targetAmount]);

  /* ---------------- VA check (manual funding) ---------------- */
  useEffect(() => {
    if (draft.primarySource !== "MANUAL") return;

    let cancelled = false;

    async function checkVA() {
      setVaLoading(true);
      try {
        const res = await api.get("/wallet/me");
        const va = res.data?.virtualAccount;

        if (!cancelled && va?.accountNumber) {
          setVaExists(true);
          setDraft((d) => ({
            ...d,
            vaAccount: va.accountNumber,
            vaBank: va.bankName,
          }));
        } else if (!cancelled) {
          setVaExists(false);
        }
      } catch {
        if (!cancelled) setVaExists(false);
      } finally {
        if (!cancelled) setVaLoading(false);
      }
    }

    checkVA();
    return () => {
      cancelled = true;
    };
  }, [draft.primarySource]);

  /* ---------------- Navigation ---------------- */
  const nextFromAmount = () => {
    const amount = Number(amountInput);
    if (!amount || amount <= 0) return;

    setDraft((d) => ({ ...d, targetAmount: amount }));
    setStep(2);
  };

  const submit = async () => {
    if (!draft.primarySource || submitting) return;

    try {
      setSubmitting(true);

      await api.post("/strict-daily", {
        targetAmount: Math.round(draft.targetAmount * 100),
        startDate: draft.startDate,
        durationDays: 30,
        primarySource: draft.primarySource,
        vaAccount:
          draft.primarySource === "MANUAL" ? draft.vaAccount : undefined,
        vaBank: draft.primarySource === "MANUAL" ? draft.vaBank : undefined,
      });

      onCreated();
      onClose();
    } catch (err) {
      console.error(err);
      alert("Failed to create Strict Daily plan");
    } finally {
      setSubmitting(false);
    }
  };

  /* ---------------- UI wrapper ---------------- */
  const Step = ({ children }: { children: React.ReactNode }) => (
    <div className="space-y-5 animate-in fade-in slide-in-from-right-5">
      {children}
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center">
      <div className="bg-white w-full max-w-lg rounded-xl p-6 relative">

        {/* STEP 1 */}
        {step === 1 && (
          <Step>
            <h2 className="text-lg font-semibold">Strict Daily Savings</h2>

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
              <div className="text-sm text-gray-600">
                ₦{dailyAmount.toLocaleString()} daily
                <div className="text-xs text-red-500 mt-1">
                  First day fee applies • No interest
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button onClick={onClose} className="btn-secondary w-full">
                Cancel
              </button>
              <button
                onClick={nextFromAmount}
                disabled={!Number(amountInput)}
                className="btn-primary w-full"
              >
                Continue
              </button>
            </div>
          </Step>
        )}

        {/* STEP 2 */}
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
              <option value="">Select funding source</option>
              <option value="AUTO">Wallet (Auto Debit)</option>
              <option value="MANUAL">Bank Transfer</option>
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
                  <p className="text-gray-500">
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
                onClick={() => setStep(3)}
                disabled={!draft.primarySource}
                className="btn-primary w-full"
              >
                Continue
              </button>
            </div>
          </Step>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <Step>
            <h2 className="text-lg font-semibold">Review</h2>

            <div className="text-sm space-y-1">
              <p><b>Total:</b> ₦{draft.targetAmount.toLocaleString()}</p>
              <p><b>Daily:</b> ₦{dailyAmount.toLocaleString()}</p>
              <p><b>Start:</b> {draft.startDate}</p>
              <p>
                <b>Funding:</b>{" "}
                {draft.primarySource === "AUTO"
                  ? "Wallet Auto Debit"
                  : "Manual Bank Transfer"}
              </p>
              <p className="text-red-500 text-xs mt-2">
                No interest • First day fee applies
              </p>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep(2)} className="btn-secondary w-full">
                Back
              </button>
              <button
                onClick={submit}
                disabled={submitting}
                className="btn-primary w-full"
              >
                {submitting ? "Saving…" : "Confirm & Start"}
              </button>
            </div>
          </Step>
        )}
      </div>
    </div>
  );
}
