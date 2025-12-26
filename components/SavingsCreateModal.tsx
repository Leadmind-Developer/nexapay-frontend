"use client";

import { useState } from "react";
import api from "@/lib/api";

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

type Props = {
  onClose: () => void;
};

export default function SavingsCreateModal({ onClose }: Props) {
  const [step, setStep] = useState(1);

  const [targetAmount, setTargetAmount] = useState<number | null>(null);
  const [durationDays, setDurationDays] = useState<number | null>(null);
  const [purpose, setPurpose] = useState("");
  const [customPurpose, setCustomPurpose] = useState("");
  const [frequency, setFrequency] =
    useState<"daily" | "weekly" | "monthly" | null>(null);
  const [startDate, setStartDate] = useState("");

  const [primarySource, setPrimarySource] =
    useState<"WALLET" | "BANK" | null>(null);

  const [bankCode, setBankCode] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [verifying, setVerifying] = useState(false);

  const interestRate =
    durationDays === null
      ? 0
      : durationDays <= 90
      ? 10
      : durationDays <= 180
      ? 20
      : durationDays <= 365
      ? 24
      : 27;

  const depositAmount =
    targetAmount && durationDays && frequency
      ? frequency === "daily"
        ? targetAmount / durationDays
        : frequency === "weekly"
        ? targetAmount / Math.ceil(durationDays / 7)
        : targetAmount / Math.ceil(durationDays / 30)
      : 0;

  async function resolveBank() {
    try {
      setVerifying(true);
      const res = await api.post("/banks/resolve", {
        bankCode,
        accountNumber
      });
      setAccountName(res.data.accountName);
    } finally {
      setVerifying(false);
    }
  }

  async function submit() {
    await api.post("/savings/goals", {
      targetAmount,
      durationDays,
      frequency,
      startDate,
      purpose: purpose === "Other" ? customPurpose : purpose,
      primarySource,
      bankDetails:
        primarySource === "BANK"
          ? { bankCode, accountNumber, accountName }
          : null
    });
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-zinc-900 w-full max-w-lg rounded-xl p-6 space-y-6">

        {/* STEP 1 */}
        {step === 1 && (
          <>
            <h2 className="text-lg font-semibold">Set your savings target</h2>

            <label className="text-sm">Target amount</label>
            <input
              type="number"
              className="input"
              onChange={e => setTargetAmount(Number(e.target.value))}
            />

            <div className="grid grid-cols-2 gap-3">
              {DURATION_PRESETS.map(p => (
                <button
                  key={p.days}
                  onClick={() => setDurationDays(p.days)}
                  className={`p-3 rounded text-white ${p.color}`}
                >
                  {p.days} days · {p.rate}% p.a
                </button>
              ))}
            </div>

            <input
              type="number"
              placeholder={
                durationDays
                  ? `${durationDays} days · ${interestRate}% p.a`
                  : "Custom duration (days)"
              }
              className="input"
              onChange={e => setDurationDays(Number(e.target.value))}
            />

            <button
              disabled={!targetAmount || !durationDays}
              onClick={() => setStep(2)}
              className="btn-primary w-full"
            >
              Continue
            </button>
          </>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <>
            <h2 className="text-lg font-semibold">I am saving for?</h2>

            <div className="grid grid-cols-2 gap-3">
              {PURPOSES.map(p => (
                <button
                  key={p}
                  onClick={() => setPurpose(p)}
                  className={`p-3 rounded font-medium ${
                    purpose === p
                      ? "bg-black text-white dark:bg-white dark:text-black"
                      : "bg-gray-100 dark:bg-zinc-800"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>

            {purpose === "Other" && (
              <input
                placeholder="Specify purpose"
                className="input"
                onChange={e => setCustomPurpose(e.target.value)}
              />
            )}

            <button
              disabled={!purpose || (purpose === "Other" && !customPurpose)}
              onClick={() => setStep(3)}
              className="btn-primary w-full"
            >
              Continue
            </button>
          </>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <>
            <h2 className="text-lg font-semibold">Savings frequency</h2>

            <div className="flex gap-3">
              {["daily", "weekly", "monthly"].map(f => (
                <button
                  key={f}
                  onClick={() => setFrequency(f as any)}
                  className={`px-4 py-2 rounded ${
                    frequency === f
                      ? "bg-black text-white dark:bg-white dark:text-black"
                      : "bg-gray-100 dark:bg-zinc-800"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>

            <label className="text-sm font-medium">Start date</label>
            <input
              type="date"
              className="input"
              onChange={e => setStartDate(e.target.value)}
            />

            {depositAmount > 0 && (
              <p className="text-sm text-gray-500">
                ₦{depositAmount.toLocaleString()} will be deducted {frequency}.
              </p>
            )}

            <button
              disabled={!frequency || !startDate}
              onClick={() => setStep(4)}
              className="btn-primary w-full"
            >
              Continue
            </button>
          </>
        )}

        {/* STEP 4 */}
        {step === 4 && (
          <>
            <h2 className="text-lg font-semibold">Funding source</h2>

            <select
              className="input"
              onChange={e => setPrimarySource(e.target.value as any)}
            >
              <option value="">Select primary source</option>
              <option value="WALLET">Nexa Wallet</option>
              <option value="BANK">External Bank</option>
            </select>

            {primarySource === "BANK" && (
              <>
                <input
                  placeholder="Bank code"
                  className="input"
                  onChange={e => setBankCode(e.target.value)}
                />
                <input
                  placeholder="Account number"
                  className="input"
                  onChange={e => setAccountNumber(e.target.value)}
                />
                <button
                  onClick={resolveBank}
                  disabled={verifying}
                  className="btn-secondary w-full"
                >
                  {verifying ? "Verifying…" : "Validate bank account"}
                </button>
                {accountName && (
                  <p className="text-sm text-green-600">
                    Account name: {accountName}
                  </p>
                )}
              </>
            )}

            <button
              disabled={
                !primarySource ||
                (primarySource === "BANK" && !accountName)
              }
              onClick={submit}
              className="btn-primary w-full"
            >
              Confirm & Save
            </button>
          </>
        )}
      </div>
    </div>
  );
}
