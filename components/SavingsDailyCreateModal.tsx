"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";

type Props = {
  onClose: () => void;
  onCreated: (goal: any) => void;
};

type DailyDraft = {
  targetAmount: string; // NAIRA
  startDate: string;
  primarySource: "MANUAL" | "AUTO" | "";
  vaAccount?: string;
  vaBank?: string;
};

type DailyScheduleItem = {
  day: number;
  date: string;
  amount: number; // KOBO
  type: "PLATFORM" | "USER";
};

const STORAGE_KEY = "savings-daily-draft";

export default function SavingsDailyCreateModal({ onClose, onCreated }: Props) {
  const [step, setStep] = useState(1);
  const [toastVisible, setToastVisible] = useState(false);

  const [draft, setDraft] = useState<DailyDraft>({
    targetAmount: "",
    startDate: new Date().toISOString().split("T")[0],
    primarySource: "",
    vaAccount: undefined,
    vaBank: undefined,
  });

  const [vaLoading, setVaLoading] = useState(false);
  const [vaExists, setVaExists] = useState(false);
  const [schedule, setSchedule] = useState<DailyScheduleItem[]>([]);

  const totalTarget = Number(draft.targetAmount) || 0;
  const dailyAmount = totalTarget / 30;

  /* ---------------- Draft persistence ---------------- */
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) setDraft(JSON.parse(saved));
  }, []);

  useEffect(() => {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
  }, [draft]);

  /* ---------------- Clear schedule when leaving review ---------------- */
  useEffect(() => {
    if (step !== 3) setSchedule([]);
  }, [step]);

  /* ---------------- Virtual account check ---------------- */
  useEffect(() => {
    if (draft.primarySource !== "MANUAL") return;

    const fetchVA = async () => {
      setVaLoading(true);
      try {
        const res = await api.get("/wallet"); // Fetch user wallet/VA
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
      } catch (err) {
        console.error("Failed to fetch virtual account:", err);
        setVaExists(false);
      } finally {
        setVaLoading(false);
      }
    };

    fetchVA();
  }, [draft.primarySource]);

  /* ---------------- Submit ---------------- */
  const submit = async () => {
    if (!draft.primarySource || !totalTarget) return;

    try {
      const res = await api.post("/strict-daily", {
        targetAmount: totalTarget,
        startDate: draft.startDate,
        primarySource: draft.primarySource,
        vaAccount: draft.vaAccount,
        vaBank: draft.vaBank,
        durationDays: 30,
        frequency: "daily",
        planType: "STRICT_DAILY",
      });

      const goal = res.data?.data; // backend returns { success: true, data: plan }
      if (!goal) throw new Error("No plan returned");

      /* Wallet debit flow */
      if (draft.primarySource === "AUTO") {
        try {
          await api.post("/wallet/debit", {
            userId: goal.userId,
            amount: totalTarget,
            reference: `SAVINGS-STRICT-${goal.id}`,
          });
          console.log("Wallet debited successfully");
        } catch (walletErr) {
          console.error("Wallet debit failed:", walletErr);
          alert("Failed to debit wallet. Please fund your wallet.");
          return;
        }
      }

      onCreated(goal);
      setToastVisible(true);
      setTimeout(() => {
        setToastVisible(false);
        onClose();
      }, 2000);

      localStorage.removeItem(STORAGE_KEY);
    } catch (err) {
      console.error("Failed to create strict daily savings:", err);
      alert("Failed to create savings. Try again.");
    }
  };

  const Step = ({ children }: { children: React.ReactNode }) => (
    <div className="animate-in fade-in slide-in-from-right-5 duration-300 space-y-6">
      {children}
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-zinc-900 w-full max-w-lg rounded-xl p-6 relative">

        {/* ---------------- Toast ---------------- */}
        {toastVisible && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg animate-fade-in-out">
            Savings Goal Created Successfully!
          </div>
        )}

        {/* STEP 1 */}
        {step === 1 && (
          <Step>
            <h2 className="text-lg font-semibold">Strict Daily Contributions</h2>
            <p className="text-sm text-gray-500">
              Save daily for 30 days. Manual transfer or wallet debit.
            </p>

            <input
              type="number"
              placeholder="Total amount (₦)"
              className="input w-full"
              value={draft.targetAmount}
              onChange={(e) =>
                setDraft((d) => ({ ...d, targetAmount: e.target.value }))
              }
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

            {dailyAmount > 0 && (
              <p className="text-sm text-gray-500">
                ₦{dailyAmount.toLocaleString()} will be paid daily.
              </p>
            )}

            <div className="flex gap-3">
              <button onClick={onClose} className="btn-secondary w-full">Cancel</button>
              <button
                disabled={!totalTarget}
                onClick={() => setStep(2)}
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
            <p className="text-sm text-gray-500">
              Choose how contributions are made.
            </p>

            <select
              className="input w-full"
              value={draft.primarySource}
              onChange={(e) =>
                setDraft((d) => ({
                  ...d,
                  primarySource: e.target.value as DailyDraft["primarySource"],
                }))
              }
            >
              <option value="">Select source</option>
              <option value="MANUAL">Manual Bank Transfer</option>
              <option value="AUTO">Wallet Debit (Auto)</option>
            </select>

            {draft.primarySource === "MANUAL" && (
              <div className="space-y-1">
                {vaLoading && (
                  <p className="text-sm text-gray-500">Checking virtual account…</p>
                )}
                {!vaLoading && vaExists && (
                  <p className="text-sm text-green-600">
                    Virtual Account: {draft.vaAccount} ({draft.vaBank})
                  </p>
                )}
                {!vaLoading && !vaExists && (
                  <p className="text-sm text-red-500">
                    A virtual account will be created after confirmation.
                  </p>
                )}
              </div>
            )}

            <div className="flex gap-3">
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

        {/* STEP 3 */}
        {step === 3 && (
          <Step>
            <h2 className="text-lg font-semibold">Review & Schedule</h2>

            <div className="text-sm space-y-1">
              <p><b>Total:</b> ₦{totalTarget.toLocaleString()}</p>
              <p><b>Duration:</b> 30 days</p>
              <p><b>Daily:</b> ₦{dailyAmount.toLocaleString()}</p>
              <p><b>Start:</b> {draft.startDate}</p>
              <p><b>Source:</b> {draft.primarySource === "WALLET" ? "Wallet Debit" : "Manual Transfer"}</p>
            </div>

            {schedule.length > 0 && (
              <div className="max-h-64 overflow-x-auto rounded border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 p-2">
                <table className="w-full text-sm text-gray-700 dark:text-gray-200">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-zinc-700">
                      <th>Day</th>
                      <th>Date</th>
                      <th>Amount (₦)</th>
                      <th>Type</th>
                    </tr>
                  </thead>
                  <tbody>
                    {schedule.map((item) => (
                      <tr key={item.day} className="border-b last:border-0">
                        <td>{item.day}</td>
                        <td>{item.date}</td>
                        <td>{(item.amount / 100).toLocaleString()}</td>
                        <td
                          className={
                            item.type === "PLATFORM"
                              ? "text-red-600 dark:text-red-400 font-medium"
                              : "text-green-600 dark:text-green-400 font-medium"
                          }
                        >
                          {item.type}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="flex gap-3">
              <button onClick={() => setStep(2)} className="btn-secondary w-full">Back</button>
              <button onClick={submit} className="btn-primary w-full">Confirm & Save</button>
            </div>
          </Step>
        )}
      </div>

      {/* ---------------- Toast Animation ---------------- */}
      <style jsx>{`
        @keyframes fade-in-out {
          0% { opacity: 0; transform: translateY(-10px); }
          10% { opacity: 1; transform: translateY(0); }
          90% { opacity: 1; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(-10px); }
        }
        .animate-fade-in-out {
          animation: fade-in-out 2s ease forwards;
        }
      `}</style>
    </div>
  );
}
