"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import SavingsCreateModal from "./SavingsCreateModal";
import WithdrawalModal from "./WithdrawalModal";

type GoalStatus = "ACTIVE" | "MATURED" | "BROKEN";

export default function Savings() {
  const [tab, setTab] = useState<GoalStatus>("ACTIVE");
  const [goals, setGoals] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [tips, setTips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [createOpen, setCreateOpen] = useState(false);
  const [withdrawGoal, setWithdrawGoal] = useState<any>(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);

        const [analyticsRes, goalsRes, aiRes] = await Promise.all([
          api.get("/savings/analytics"),
          api.get("/savings/goals"),
          api.get("/savings/ai/recommendations")
        ]);

        setSummary(analyticsRes.data.data);
        setGoals(goalsRes.data.data || []);
        setTips(aiRes.data.tips || []);
      } catch (err) {
        console.error("Savings load error:", err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const filteredGoals = goals.filter(g => g.status === tab);

  const formatMoney = (v = 0) =>
    `₦${Number(v).toLocaleString()}`;

  return (
    <div className="p-6 space-y-6">
      {/* SUMMARY */}
      <div className="bg-white rounded-xl p-4 shadow">
        <div className="flex flex-wrap justify-between gap-4">
          <div>
            <p className="text-sm text-gray-500">Total Saved</p>
            <p className="text-xl font-bold">
              {formatMoney(summary?.totalSaved)}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Interest Earned</p>
            <p className="text-xl font-bold text-green-600">
              {formatMoney(summary?.totalInterest)}
            </p>
          </div>

          <span className="self-start rounded-full bg-green-100 text-green-700 px-3 py-1 text-xs font-medium">
            Up to 23% p.a
          </span>
        </div>
      </div>

      {/* AI RECOMMENDATIONS */}
      {tips.length > 0 && (
        <div className="bg-white rounded-xl p-4 shadow">
          <h3 className="font-semibold mb-2">Smart Savings Tips</h3>
          <ul className="space-y-1 text-sm text-gray-600">
            {tips.map((t, i) => (
              <li key={i}>• {t.message}</li>
            ))}
          </ul>
        </div>
      )}

      {/* TABS */}
      <div className="flex gap-6 border-b">
        {(["ACTIVE", "MATURED", "BROKEN"] as GoalStatus[]).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`pb-2 ${
              tab === t
                ? "border-b-2 border-black font-semibold"
                : "text-gray-400"
            }`}
          >
            {t.toLowerCase()}
          </button>
        ))}
      </div>

      {/* GOALS */}
      {loading ? (
        <p className="text-sm text-gray-500">Loading savings…</p>
      ) : filteredGoals.length === 0 ? (
        <p className="text-sm text-gray-500">
          No {tab.toLowerCase()} savings goals.
        </p>
      ) : (
        <div className="grid gap-4">
          {filteredGoals.map(goal => {
            const progress =
              goal.targetAmount > 0
                ? Math.min(
                    (goal.currentBalance / goal.targetAmount) * 100,
                    100
                  )
                : 0;

            return (
              <div
                key={goal.id}
                className="p-4 bg-white rounded-xl shadow space-y-2"
              >
                <div className="flex justify-between">
                  <h3 className="font-semibold">{goal.title}</h3>
                  <span className="text-xs text-gray-400">
                    {goal.durationDays} days
                  </span>
                </div>

                <p className="text-sm">
                  {formatMoney(goal.currentBalance)} /{" "}
                  {formatMoney(goal.targetAmount)}
                </p>

                {/* PROGRESS BAR */}
                <div>
                  <div className="h-2 bg-gray-200 rounded">
                    <div
                      className="h-2 rounded bg-green-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <p className="text-xs mt-1 text-gray-500">
                    {progress.toFixed(1)}% complete
                  </p>
                </div>

                {tab === "ACTIVE" && (
                  <button
                    onClick={() => setWithdrawGoal(goal)}
                    className="text-red-500 text-sm"
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
      <button
        onClick={() => setCreateOpen(true)}
        className="fixed bottom-6 right-6 bg-black text-white px-5 py-3 rounded-full shadow-lg"
      >
        Create New Goal
      </button>

      {createOpen && (
        <SavingsCreateModal onClose={() => setCreateOpen(false)} />
      )}

      {withdrawGoal && (
        <WithdrawalModal
          goal={withdrawGoal}
          onClose={() => setWithdrawGoal(null)}
        />
      )}
    </div>
  );
}
