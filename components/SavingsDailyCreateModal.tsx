"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";

type Props = { onClose: () => void };

type DailyDraft = {
  targetAmount: string;
  startDate: string;
  primarySource: "MANUAL" | "";
  vaAccount?: string;
  vaBank?: string;
};

const STORAGE_KEY = "savings-daily-draft";

export default function SavingsDailyCreateModal({ onClose }: Props) {
  const [step, setStep] = useState(1);
  const [draft, setDraft] = useState<DailyDraft>({
    targetAmount: "",
    startDate: new Date().toISOString().split("T")[0],
    primarySource: "",
    vaAccount: undefined,
    vaBank: undefined,
  });
  const [vaLoading, setVaLoading] = useState(false);
  const [vaExists, setVaExists] = useState(false);

  const depositAmount = Number(draft.targetAmount) / 30; // Strict daily contributions

  /* ---------------- Draft persistence ---------------- */
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) setDraft(JSON.parse(saved));
  }, []);

  useEffect(() => {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
  }, [draft]);

  /* ---------------- Check or create VA ---------------- */
  useEffect(() => {
    if (draft.primarySource !== "MANUAL") return;

    const fetchVA = async () => {
      setVaLoading(true);
      try {
        const res = await api.get("/wallet/virtual-account");
        if (res.data?.accountNumber) {
          setVaExists(true);
          setDraft(d => ({
            ...d,
            vaAccount: res.data.accountNumber,
            vaBank: res.data.bankName,
          }));
        } else {
          setVaExists(false);
        }
      } catch (err) {
        setVaExists(false);
      } finally {
        setVaLoading(false);
      }
    };

    fetchVA();
  }, [draft.primarySource]);

  /* ---------------- Submit ---------------- */
  const submit = async () => {
    if (!draft.primarySource || !draft.targetAmount) return;

    await api.post("/savings/strict-daily", {
      targetAmount: Number(draft.targetAmount),
      startDate: draft.startDate,
      primarySource: draft.primarySource,
      vaAccount: draft.vaAccount,
      vaBank: draft.vaBank,
      durationDays: 30,
      frequency: "daily",
      planType: "STRICT_DAILY",
    });

    localStorage.removeItem(STORAGE_KEY);
    onClose();
  };

  const Step = ({ children }: { children: React.ReactNode }) => (
    <div className="animate-in fade-in slide-in-from-right-5 duration-300 space-y-6">
      {children}
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-zinc-900 w-full max-w-lg rounded-xl p-6">

        {/* STEP 1: Amount & start date */}
        {step === 1 && (
          <Step>
            <h2 className="text-lg font-semibold">Strict Daily Contributions</h2>
            <p className="text-sm text-gray-500">Set your total savings for 30 days.</p>

            <input
              type="number"
              placeholder="Total amount"
              className="input w-full"
              value={draft.targetAmount}
              onChange={e =>
                setDraft(d => ({ ...d, targetAmount: e.target.value }))
              }
            />

            <label className="text-sm text-gray-500 mt-2">Start Date</label>
            <input
              type="date"
              className="input w-full"
              value={draft.startDate}
              onChange={e =>
                setDraft(d => ({ ...d, startDate: e.target.value }))
              }
            />

            {depositAmount > 0 && (
              <p className="text-sm text-gray-500 mt-1">
                ₦{depositAmount.toLocaleString()} will be contributed daily.
              </p>
            )}

            <div className="flex gap-3 mt-4">
              <button onClick={onClose} className="btn-secondary w-full">Cancel</button>
              <button
                disabled={!draft.targetAmount}
                onClick={() => setStep(2)}
                className="btn-primary w-full"
              >
                Continue
              </button>
            </div>
          </Step>
        )}

        {/* STEP 2: Funding source */}
        {step === 2 && (
          <Step>
            <h2 className="text-lg font-semibold">Funding Source</h2>
            <p className="text-sm text-gray-500">All contributions are manual transfers.</p>

            <select
              className="input w-full"
              value={draft.primarySource}
              onChange={e =>
                setDraft(d => ({ ...d, primarySource: e.target.value as DailyDraft["primarySource"] }))
              }
            >
              <option value="">Select source</option>
              <option value="MANUAL">Manual Bank Transfer</option>
            </select>

            {draft.primarySource === "MANUAL" && (
              <div className="mt-3 space-y-2">
                {vaLoading && <p className="text-sm text-gray-500">Checking virtual account…</p>}
                {!vaLoading && vaExists && (
                  <p className="text-sm text-green-600">
                    Virtual Account: {draft.vaAccount} ({draft.vaBank})
                  </p>
                )}
                {!vaLoading && !vaExists && (
                  <p className="text-sm text-red-500">
                    You don&apos;t have a virtual account yet. One will be created on confirmation.
                  </p>
                )}
              </div>
            )}

            <div className="flex gap-3 mt-4">
              <button onClick={() => setStep(1)} className="btn-secondary w-full">Back</button>
              <button
                disabled={!draft.primarySource}
                onClick={() => setStep(3)}
                className="btn-primary w-full"
              >
                Continue
              </button>
            </div>
          </Step>
        )}

        {/* STEP 3: Review */}
        {step === 3 && (
          <Step>
            <h2 className="text-lg font-semibold">Review & Confirm</h2>

            <div className="text-sm space-y-2">
              <p><b>Total Target:</b> ₦{Number(draft.targetAmount).toLocaleString()}</p>
              <p><b>Duration:</b> 30 days</p>
              <p><b>Daily Contribution:</b> ₦{depositAmount.toLocaleString()}</p>
              <p><b>Start Date:</b> {draft.startDate}</p>
              <p><b>Source:</b> Manual Transfer</p>
              {draft.vaAccount && (
                <p><b>Virtual Account:</b> {draft.vaAccount} ({draft.vaBank})</p>
              )}
            </div>

            <div className="flex gap-3 mt-4">
              <button onClick={() => setStep(2)} className="btn-secondary w-full">Back</button>
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
