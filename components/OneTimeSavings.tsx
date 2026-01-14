// components/OneTimeSavings.tsx
"use client";

import { useEffect, useState, useMemo } from "react";
import api from "@/lib/api";
import OneTimeSavingsCreateModal from "./OneTimeSavingsCreateModal";
import WithdrawalModal from "./WithdrawalModal";

type GoalStatus = "ACTIVE" | "MATURED" | "BROKEN";

type OneTimeGoal = {
  id: string;
  title: string;
  status: GoalStatus;
  currentBalance: number;
  targetAmount: number;
  startDate: string;
};

type OneTimeSummary = {
  totalSaved: number;
};

export default function OneTimeSavings() {
  const [tab, setTab] = useState<GoalStatus>("ACTIVE");
  const [goals, setGoals] = useState<OneTimeGoal[]>([]);
  const [summary, setSummary] = useState<OneTimeSummary | null>(null);
  const [loading, setLoading] = useState(true);

  const [createOpen, setCreateOpen] = useState(false);
  const [withdrawGoal, setWithdrawGoal] = useState<OneTimeGoal | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);

        const [goalsRes, summaryRes] = await Promise.all([
          api.get("/savings/onetime"),
          api.get("/savings/onetime/analytics"), // optional endpoint if you have
        ]);

        setGoals(goalsRes.data?.goals ?? []);
        setSummary({
          totalSaved: Number(summaryRes?.data?.totalSaved ?? 0),
        });
      } catch (err) {
        console.error("One-time savings load error:", err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const filteredGoals = useMemo(
    () => goals.filter(g => g.status?.toUpperCase() === tab),
    [goals, tab]
  );

  const formatMoney = (v = 0) => `₦${Number(v).toLocaleString()}`;

  return (
    <div className="p-6 space-y-6">
      {/* SUMMARY */}
      <div className="bg-white rounded-xl p-4 shadow">
        <p className="text-sm text-gray-500">Total Saved</p>
        <p className="text-xl font-bold">{formatMoney(summary?.totalSaved)}</p>
      </div>

      {/* TABS */}
      <div className="flex gap-6 border-b">
        {(["ACTIVE", "MATURED", "BROKEN"] as GoalStatus[]).map(status => (
          <button
            key={status}
            onClick={() => setTab(status)}
            className={`pb-2 transition-colors ${
              tab === status
                ? "border-b-2 border-black font-semibold"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            {status.toLowerCase()}
          </button>
        ))}
      </div>

      {/* GOALS */}
      {loading ? (
        <p className="text-sm text-gray-500">Loading one-time savings…</p>
      ) : filteredGoals.length === 0 ? (
        <p className="text-sm text-gray-500">
          No {tab.toLowerCase()} one-time savings.
        </p>
      ) : (
        <div className="grid gap-4">
          {filteredGoals.map(goal => {
            const progress =
              goal.targetAmount > 0
                ? Math.min((goal.currentBalance / goal.targetAmount) * 100, 100)
                : 0;

            return (
              <div key={goal.id} className="p-4 bg-white rounded-xl shadow space-y-3">
                <div className="flex justify-between">
                  <h3 className="font-semibold">{goal.title}</h3>
                  <span className="text-xs text-gray-400">
                    {new Date(goal.startDate).toLocaleDateString()}
                  </span>
                </div>

                <p className="text-sm">
                  {formatMoney(goal.currentBalance)} / {formatMoney(goal.targetAmount)}
                </p>

                <div>
                  <div className="h-2 bg-gray-200 rounded overflow-hidden">
                    <div
                      className="h-2 bg-green-500 rounded transition-all duration-700 ease-out"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <p className="text-xs mt-1 text-gray-500">{progress.toFixed(1)}% complete</p>
                </div>

                {tab === "ACTIVE" && (
                  <button
                    onClick={() => setWithdrawGoal(goal)}
                    className="text-red-500 text-sm hover:underline"
                  >
                    Request Withdrawal
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* FLOATING CTA */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-2 z-40">
        <button
          onClick={() => setCreateOpen(true)}
          className="
            px-5 py-3 rounded-full shadow-lg transition-transform hover:scale-105
            bg-green-600 text-white
            dark:bg-green-500 dark:text-black
          "
        >
          Create One-Time Savings
        </button>
      </div>

      {/* MODALS */}
      {createOpen && <OneTimeSavingsCreateModal onClose={() => setCreateOpen(false)} />}
      {withdrawGoal && (
        <WithdrawalModal goal={withdrawGoal} onClose={() => setWithdrawGoal(null)} />
      )}
    </div>
  );
}
