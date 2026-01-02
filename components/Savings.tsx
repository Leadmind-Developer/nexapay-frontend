"use client";

import { useEffect, useMemo, useState } from "react";
import api from "@/lib/api";

import SavingsCreateModal from "./SavingsCreateModal";
import SavingsDailyCreateModal from "./SavingsDailyCreateModal";
import WithdrawalModal from "./WithdrawalModal";
import SavingsAI from "./SavingsAI";

/* ---------------- Types ---------------- */

type GoalStatus = "ACTIVE" | "MATURED" | "BROKEN";

type SavingsGoal = {
  id: string;
  title: string;
  status: GoalStatus;
  currentBalance: number;
  targetAmount: number;
  durationDays: number;
};

type SavingsSummary = {
  totalSaved: number;
  totalInterest: number;
};

type SavingsTip = {
  message: string;
};

/* ---------------- Component ---------------- */

export default function Savings() {
  /* -------- View state -------- */
  const [tab, setTab] = useState<GoalStatus>("ACTIVE");
  const [loading, setLoading] = useState(true);

  /* -------- Data -------- */
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [summary, setSummary] = useState<SavingsSummary | null>(null);
  const [tips, setTips] = useState<SavingsTip[]>([]);

  /* -------- Modals (OPEN STATE ONLY) -------- */
  const [createOpen, setCreateOpen] = useState(false);
  const [dailyCreateOpen, setDailyCreateOpen] = useState(false);
  const [withdrawGoal, setWithdrawGoal] = useState<SavingsGoal | null>(null);

  /* ---------------- Load savings data ---------------- */

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        setLoading(true);

        const [analyticsRes, goalsRes, aiRes] = await Promise.all([
          api.get("/savings/analytics"),
          api.get("/savings/goals"),
          api.get("/savings/ai/recommendations"),
        ]);

        if (!mounted) return;

        setSummary(analyticsRes.data?.summary ?? null);
        setGoals(goalsRes.data?.goals ?? []);
        setTips(aiRes.data?.tips ?? []);
      } catch (err) {
        console.error("Savings load error:", err);
      } finally {
        mounted && setLoading(false);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, []);

  /* ---------------- Derived ---------------- */

  const filteredGoals = useMemo(
    () => goals.filter((g) => g.status === tab),
    [goals, tab]
  );

  const formatMoney = (v = 0) => `₦${Number(v).toLocaleString()}`;

  /* ---------------- Render ---------------- */

  return (
    <div className="p-6 space-y-6">

      {/* ================= SUMMARY ================= */}
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

          <span className="rounded-full bg-green-100 text-green-700 px-3 py-1 text-xs font-medium">
            Up to 23% p.a
          </span>
        </div>
      </div>

      {/* ================= AI TIPS ================= */}
      {tips.length > 0 && <SavingsAI tips={tips} />}

      {/* ================= TABS ================= */}
      <div className="flex gap-6 border-b">
        {(["ACTIVE", "MATURED", "BROKEN"] as GoalStatus[]).map((status) => (
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

      {/* ================= GOALS ================= */}
      {loading ? (
        <p className="text-sm text-gray-500">Loading savings…</p>
      ) : filteredGoals.length === 0 ? (
        <p className="text-sm text-gray-500">
          No {tab.toLowerCase()} savings goals.
        </p>
      ) : (
        <div className="grid gap-4">
          {filteredGoals.map((goal) => {
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
                className="p-4 bg-white rounded-xl shadow space-y-3"
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

                <div>
                  <div className="h-2 bg-gray-200 rounded overflow-hidden">
                    <div
                      className="h-2 bg-green-500 transition-all duration-700"
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

      {/* ================= FLOATING CTA ================= */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-2 z-40">
        <button
          onClick={() => setCreateOpen(true)}
          className="px-5 py-3 rounded-full shadow-lg bg-green-600 text-white hover:scale-105 transition"
        >
          Create Savings Goal
        </button>

        <button
          onClick={() => setDailyCreateOpen(true)}
          className="px-5 py-3 rounded-full shadow bg-white border hover:bg-gray-100"
        >
          Strict Daily Savings
        </button>
      </div>

      {/* ================= MODALS (ALWAYS MOUNTED) ================= */}

      <SavingsCreateModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
      />

      <SavingsDailyCreateModal
        open={dailyCreateOpen}
        onClose={() => setDailyCreateOpen(false)}
        onCreated={(goal) => {
          setGoals((prev) => [goal, ...prev]);
          setTab("ACTIVE");
        }}
      />

      <WithdrawalModal
        open={!!withdrawGoal}
        goal={withdrawGoal}
        onClose={() => setWithdrawGoal(null)}
      />
    </div>
  );
}
