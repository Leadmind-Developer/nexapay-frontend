"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";

const STORAGE_KEY = "savings-create-draft";

const PURPOSES = [
  "Car",
  "Rent",
  "Education",
  "Family",
  "Business",
  "Vacation",
  "Flight Costs",
  "Other"
];

const DURATION_PRESETS = [
  { days: 90, rate: 10, color: "bg-amber-500" },
  { days: 180, rate: 20, color: "bg-green-600" },
  { days: 365, rate: 24, color: "bg-emerald-600" },
  { days: 730, rate: 27, color: "bg-lime-700" }
];

type SavingsDraft = {
  targetAmount: string;
  durationDays: string | number;
  purpose: string;
  customPurpose: string;
  frequency: "daily" | "weekly" | "monthly" | "";
  startDate: string;
  primarySource: "WALLET" | "BANK" | "";
  bankCode: string;
  accountNumber: string;
  accountName: string;
};

const FREQUENCIES = ["daily", "weekly", "monthly"] as const;

type Frequency = SavingsDraft["frequency"];

type Props = { onClose: () => void };

export default function SavingsCreateModal({ onClose }: Props) {
  const [step, setStep] = useState(1);
  const [banks, setBanks] = useState<any[]>([]);
  const [verifying, setVerifying] = useState(false);
  const [isValidAccount, setIsValidAccount] = useState(false);

  const [draft, setDraft] = useState<SavingsDraft>({
    targetAmount: "",
    durationDays: "",
    purpose: "",
    customPurpose: "",
    frequency: "",
    startDate: "",
    primarySource: "",
    bankCode: "",
    accountNumber: "",
    accountName: ""
  });

  /* ---------------- Draft persistence ---------------- */
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) setDraft(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
  }, [draft]);

  /* ---------------- Fetch banks ---------------- */
  useEffect(() => {
    api.get("/paystack/banks")
      .then(res => setBanks(res.data.data || []))
      .catch(() => {});
  }, []);

  /* ---------------- Auto resolve bank ---------------- */
  useEffect(() => {
    if (draft.accountNumber.length !== 10 || !draft.bankCode) {
      setDraft(d => ({ ...d, accountName: "" }));
      setIsValidAccount(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setVerifying(true);
        const res = await api.get(
          `/paystack/resolve-account?account_number=${draft.accountNumber}&bank_code=${draft.bankCode}`
        );

        if (res.data?.success) {
          setDraft(d => ({
            ...d,
            accountName: res.data.data.account_name
          }));
          setIsValidAccount(true);
        } else {
          setIsValidAccount(false);
        }
      } catch {
        setIsValidAccount(false);
      } finally {
        setVerifying(false);
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [draft.accountNumber, draft.bankCode]);

  const duration = Number(draft.durationDays) || 0;
  const target = Number(draft.targetAmount) || 0;

  /* ---------------- Derived values ---------------- */
  const interestRate =
    duration <= 90
      ? 10
      : duration <= 180
      ? 20
      : duration <= 365
      ? 24
      : 27;

  const depositAmount =
    target && duration && draft.frequency
      ? draft.frequency === "daily"
        ? target / duration
        : draft.frequency === "weekly"
        ? target / Math.ceil(duration / 7)
        : target / Math.ceil(duration / 30)
      : 0;

  /* ---------------- Submit ---------------- */
  async function submit() {
    await api.post("/savings/goals", {
      targetAmount: Number(draft.targetAmount),
      durationDays: Number(draft.durationDays),
      frequency: draft.frequency,
      startDate: draft.startDate,
      purpose:
        draft.purpose === "Other" ? draft.customPurpose : draft.purpose,
      primarySource: draft.primarySource,
      bankDetails:
        draft.primarySource === "BANK"
          ? {
              bankCode: draft.bankCode,
              accountNumber: draft.accountNumber,
              accountName: draft.accountName
            }
          : null
    });

    localStorage.removeItem(STORAGE_KEY);
    onClose();
  }

  /* ---------------- Step wrapper ---------------- */
  const Step = ({ children }: { children: React.ReactNode }) => (
    <div
      key={step}
      className="animate-in fade-in slide-in-from-right-5 duration-300 space-y-6"
    >
      {children}
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-zinc-900 w-full max-w-lg rounded-xl p-6">

        {/* STEP 1 */}
        {step === 1 && (
          <Step>
            <div className="space-y-2">
              <h2 className="text-lg font-semibold">Set your savings target</h2>
              <p className="text-sm text-gray-500">
                How much do you want to save?
              </p>
            </div>

            <input
              type="number"
              placeholder="Target amount"
              className="input"
              value={draft.targetAmount}
              onChange={e =>
                setDraft(d => ({ ...d, targetAmount: e.target.value }))
              }
            />

            <div className="grid grid-cols-2 gap-3">
              {DURATION_PRESETS.map(p => (
                <button
                  key={p.days}
                  onClick={() =>
                    setDraft(d => ({ ...d, durationDays: p.days }))
                  }
                  className={`p-3 rounded text-white ${p.color}`}
                >
                  {p.days} days · {p.rate}% p.a
                </button>
              ))}
            </div>

            <input
              type="number"
              placeholder="Custom duration (days)"
              className="input"
              value={draft.durationDays}
              onChange={e =>
                setDraft(d => ({ ...d, durationDays: e.target.value }))
              }
            />

            <button
              disabled={!draft.targetAmount || !draft.durationDays}
              onClick={() => setStep(2)}
              className="btn-primary w-full"
            >
              Continue
            </button>
          </Step>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <Step>
            <h2 className="text-lg font-semibold">I am saving for?</h2>

            <div className="grid grid-cols-2 gap-3">
              {PURPOSES.map(p => (
                <button
                  key={p}
                  onClick={() => setDraft(d => ({ ...d, purpose: p }))}
                  className={`p-3 rounded ${
                    draft.purpose === p
                      ? "bg-black text-white dark:bg-white dark:text-black"
                      : "bg-gray-100 dark:bg-zinc-800"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>

            {draft.purpose === "Other" && (
              <input
                placeholder="Specify purpose"
                className="input"
                value={draft.customPurpose}
                onChange={e =>
                  setDraft(d => ({ ...d, customPurpose: e.target.value }))
                }
              />
            )}

            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="btn-secondary w-full">
                Back
              </button>
              <button
                disabled={
                  !draft.purpose ||
                  (draft.purpose === "Other" && !draft.customPurpose)
                }
                onClick={() => setStep(3)}
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
            <h2 className="text-lg font-semibold">Savings frequency</h2>

            <div className="flex gap-3">
              {FREQUENCIES.map((f: Frequency) => (
                <button
                  key={f}
                  onClick={() => setDraft(d => ({ ...d, frequency: f }))}
                  className={`px-4 py-2 rounded ${
                    draft.frequency === f
                      ? "bg-black text-white dark:bg-white dark:text-black"
                      : "bg-gray-100 dark:bg-zinc-800"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>

            <input
              type="date"
              className="input"
              value={draft.startDate}
              onChange={e =>
                setDraft(d => ({ ...d, startDate: e.target.value }))
              }
            />

            {depositAmount > 0 && (
              <p className="text-sm text-gray-500">
                ₦{depositAmount.toLocaleString()} will be deducted {draft.frequency}.
              </p>
            )}

            <div className="flex gap-3">
              <button onClick={() => setStep(2)} className="btn-secondary w-full">
                Back
              </button>
              <button
                disabled={!draft.frequency || !draft.startDate}
                onClick={() => setStep(4)}
                className="btn-primary w-full"
              >
                Continue
              </button>
            </div>
          </Step>
        )}

        {/* STEP 4 */}
        {step === 4 && (
          <Step>
            <h2 className="text-lg font-semibold">Funding source</h2>

            <select
              className="input"
              value={draft.primarySource}
              onChange={e =>
                setDraft(d => ({ ...d, primarySource: e.target.value }))
              }
            >
              <option value="">Select source</option>
              <option value="WALLET">Nexa Wallet</option>
              <option value="BANK">External Bank</option>
            </select>

            {draft.primarySource === "BANK" && (
              <>
                <select
                  className="input"
                  value={draft.bankCode}
                  onChange={e =>
                    setDraft(d => ({ ...d, bankCode: e.target.value }))
                  }
                >
                  <option value="">Select bank</option>
                  {banks.map(b => (
                    <option key={b.code} value={b.code}>
                      {b.name}
                    </option>
                  ))}
                </select>

                <input
                  placeholder="Account number"
                  maxLength={10}
                  className="input"
                  value={draft.accountNumber}
                  onChange={e =>
                    setDraft(d => ({ ...d, accountNumber: e.target.value }))
                  }
                />

                {verifying && (
                  <p className="text-sm text-gray-500">Verifying account…</p>
                )}

                {isValidAccount && (
                  <p className="text-sm text-green-600">
                    {draft.accountName}
                  </p>
                )}
              </>
            )}

            <div className="flex gap-3">
              <button onClick={() => setStep(3)} className="btn-secondary w-full">
                Back
              </button>
              <button
                disabled={
                  !draft.primarySource ||
                  (draft.primarySource === "BANK" && !isValidAccount)
                }
                onClick={() => setStep(5)}
                className="btn-primary w-full"
              >
                Review
              </button>
            </div>
          </Step>
        )}

        {/* STEP 5 */}
        {step === 5 && (
          <Step>
            <h2 className="text-lg font-semibold">Review & confirm</h2>

            <div className="text-sm space-y-2">
              <p><b>Target:</b> ₦{Number(draft.targetAmount).toLocaleString()}</p>
              <p><b>Duration:</b> {draft.durationDays} days ({interestRate}% p.a)</p>
              <p><b>Purpose:</b> {draft.purpose === "Other" ? draft.customPurpose : draft.purpose}</p>
              <p><b>Frequency:</b> {draft.frequency}</p>
              <p><b>Deposit:</b> ₦{depositAmount.toLocaleString()}</p>
              <p><b>Start date:</b> {draft.startDate}</p>
              <p><b>Source:</b> {draft.primarySource}</p>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep(4)} className="btn-secondary w-full">
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
