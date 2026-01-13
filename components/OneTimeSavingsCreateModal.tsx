// components/OneTimeSavingsCreateModal.tsx
"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";

const PURPOSES = [
  "Car",
  "Rent",
  "Education",
  "Family",
  "Business",
  "Vacation",
  "Flight Costs",
  "Other",
];

type SavingsDraft = {
  targetAmount: string;
  purpose: string;
  customPurpose: string;
  startDate: string;
  primarySource: "WALLET" | "BANK" | "";
  bankCode: string;
  accountNumber: string;
  accountName: string;
};

type Props = { onClose: () => void };

export default function OneTimeSavingsCreateModal({ onClose }: Props) {
  const [step, setStep] = useState(1);
  const [banks, setBanks] = useState<any[]>([]);
  const [verifying, setVerifying] = useState(false);
  const [isValidAccount, setIsValidAccount] = useState(false);

  const [draft, setDraft] = useState<SavingsDraft>({
    targetAmount: "",
    purpose: "",
    customPurpose: "",
    startDate: "",
    primarySource: "",
    bankCode: "",
    accountNumber: "",
    accountName: "",
  });

  // Fetch banks
  useEffect(() => {
    api
      .get("/paystack/banks")
      .then(res => setBanks(res.data?.data || []))
      .catch(() => {});
  }, []);

  // Auto resolve bank account
  useEffect(() => {
    if (draft.accountNumber.length !== 10 || !draft.bankCode) {
      setDraft(d => ({ ...d, accountName: "" }));
      setIsValidAccount(false);
      return;
    }

    const t = setTimeout(async () => {
      try {
        setVerifying(true);
        const res = await api.get(
          `/paystack/resolve-account?account_number=${draft.accountNumber}&bank_code=${draft.bankCode}`
        );
        if (res.data?.success) {
          setDraft(d => ({
            ...d,
            accountName: res.data.data.account_name,
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

    return () => clearTimeout(t);
  }, [draft.accountNumber, draft.bankCode]);

  const submit = async () => {
    try {
      await api.post("/savings/onetime", {
        targetAmount: Number(draft.targetAmount),
        purpose: draft.purpose === "Other" ? draft.customPurpose : draft.purpose,
        startDate: draft.startDate,
        primarySource: draft.primarySource,
        secondarySource:
          draft.primarySource === "BANK"
            ? JSON.stringify({
                bankCode: draft.bankCode,
                accountNumber: draft.accountNumber,
                accountName: draft.accountName,
              })
            : undefined,
      });

      onClose();
    } catch (err: any) {
      alert(err?.response?.data?.message || err.message);
    }
  };

  const Step = ({ children }: { children: React.ReactNode }) => (
    <div className="animate-in fade-in slide-in-from-right-5 duration-300 space-y-6">
      {children}
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-zinc-900 w-full max-w-lg rounded-xl p-6">

        {/* STEP 1: Amount */}
        {step === 1 && (
          <Step>
            <h2 className="text-lg font-semibold">Enter lump sum amount</h2>
            <input
              type="text"
              inputMode="numeric"
              placeholder="Target amount"
              className="input w-full"
              value={draft.targetAmount}
              onChange={e =>
                setDraft(d => ({
                  ...d,
                  targetAmount: e.target.value.replace(/\D/g, ""),
                }))
              }
            />

            <button
              type="button"
              disabled={!draft.targetAmount}
              onClick={() => setStep(2)}
              className="btn-primary w-full"
            >
              Continue
            </button>
          </Step>
        )}

        {/* STEP 2: Purpose */}
        {step === 2 && (
          <Step>
            <h2 className="text-lg font-semibold">I am saving for?</h2>

            <div className="grid grid-cols-2 gap-3">
              {PURPOSES.map(p => (
                <button
                  key={p}
                  type="button"
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
                className="input w-full"
                value={draft.customPurpose}
                onChange={e =>
                  setDraft(d => ({ ...d, customPurpose: e.target.value }))
                }
              />
            )}

            <div className="flex gap-3">
              <button type="button" onClick={() => setStep(1)} className="btn-secondary w-full">
                Back
              </button>
              <button
                type="button"
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

        {/* STEP 3: Start date & source */}
        {step === 3 && (
          <Step>
            <h2 className="text-lg font-semibold">Start date & funding source</h2>

            <label className="text-sm font-medium">Start date</label>
            <input
              type="date"
              className="input w-full"
              value={draft.startDate}
              onChange={e => setDraft(d => ({ ...d, startDate: e.target.value }))}
            />

            <select
              className="input w-full mt-2"
              value={draft.primarySource}
              onChange={e =>
                setDraft(d => ({ ...d, primarySource: e.target.value as "WALLET" | "BANK" | "" }))
              }
            >
              <option value="">Select source</option>
              <option value="WALLET">Nexa Wallet</option>
              <option value="BANK">External Bank</option>
            </select>

            {draft.primarySource === "BANK" && (
              <>
                <select
                  className="input w-full mt-2"
                  value={draft.bankCode}
                  onChange={e => setDraft(d => ({ ...d, bankCode: e.target.value }))}
                >
                  <option value="">Select bank</option>
                  {banks.map(b => (
                    <option key={b.code} value={b.code}>{b.name}</option>
                  ))}
                </select>

                <input
                  placeholder="Account number"
                  maxLength={10}
                  className="input w-full mt-2"
                  value={draft.accountNumber}
                  onChange={e => setDraft(d => ({ ...d, accountNumber: e.target.value }))}
                />

                {verifying && <p className="text-sm text-gray-500">Verifying account…</p>}
                {isValidAccount && <p className="text-sm text-green-600">{draft.accountName}</p>}
              </>
            )}

            <div className="flex gap-3 mt-3">
              <button type="button" onClick={() => setStep(2)} className="btn-secondary w-full">
                Back
              </button>
              <button
                type="button"
                disabled={!draft.startDate || !draft.primarySource || (draft.primarySource === "BANK" && !isValidAccount)}
                onClick={() => setStep(4)}
                className="btn-primary w-full"
              >
                Review
              </button>
            </div>
          </Step>
        )}

        {/* STEP 4: Review & confirm */}
        {step === 4 && (
          <Step>
            <h2 className="text-lg font-semibold">Review & confirm</h2>
            <div className="text-sm space-y-2">
              <p><b>Target:</b> ₦{Number(draft.targetAmount).toLocaleString()}</p>
              <p><b>Purpose:</b> {draft.purpose === "Other" ? draft.customPurpose : draft.purpose}</p>
              <p><b>Start date:</b> {draft.startDate}</p>
              <p><b>Source:</b> {draft.primarySource}</p>
              {draft.primarySource === "BANK" && (
                <p><b>Account:</b> {draft.accountName}</p>
              )}
            </div>

            <div className="flex gap-3 mt-3">
              <button type="button" onClick={() => setStep(3)} className="btn-secondary w-full">
                Back
              </button>
              <button type="button" onClick={submit} className="btn-primary w-full">
                Confirm & Save
              </button>
            </div>
          </Step>
        )}
      </div>
    </div>
  );
}
