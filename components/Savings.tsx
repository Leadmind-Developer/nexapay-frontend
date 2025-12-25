"use client";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import SavingsCreateModal from "./SavingsCreateModal";
import WithdrawalModal from "./WithdrawalModal";

export default function Savings() {
  const [tab, setTab] = useState("ACTIVE");
  const [goals, setGoals] = useState([]);
  const [summary, setSummary] = useState(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [withdrawGoal, setWithdrawGoal] = useState(null);

  useEffect(() => {
    api.get("/savings/summary").then(r => setSummary(r.data));
    api.get(`/savings/goals?status=${tab}`).then(r => setGoals(r.data));
  }, [tab]);

  return (
    <div className="p-6 space-y-6">
      {/* Summary Card */}
      <div className="bg-white rounded-xl p-4 shadow">
        <div className="flex justify-between">
          <div>
            <p className="text-sm text-gray-500">Total Saved</p>
            <p className="text-xl font-bold">₦{summary?.totalSaved}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Wallet Balance</p>
            <p className="text-xl font-bold">₦{summary?.walletBalance}</p>
          </div>
          <span className="badge bg-green-100 text-green-700">
            Up to 23% p.a
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4">
        {["ACTIVE", "MATURED", "BROKEN"].map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={tab === t ? "font-bold" : "text-gray-400"}
          >
            {t.toLowerCase()}
          </button>
        ))}
      </div>

      {/* Goals */}
      <div className="grid gap-4">
        {goals.map(goal => (
          <div key={goal.id} className="p-4 bg-white rounded-xl shadow">
            <h3 className="font-semibold">{goal.title}</h3>
            <p>₦{goal.currentBalance} / ₦{goal.targetAmount}</p>
            <div className="mt-2">
  <div className="h-2 bg-gray-200 rounded">
    <div
      className="h-2 rounded bg-green-500"
      style={{
        width: `${(goal.currentBalance / goal.targetAmount) * 100}%`
      }}
    />
  </div>

  <p className="text-xs mt-1">
    ₦{goal.currentBalance.toLocaleString()} / ₦{goal.targetAmount.toLocaleString()}
  </p>
</div>


            {tab === "ACTIVE" && (
              <button
                onClick={() => setWithdrawGoal(goal)}
                className="text-red-500 text-sm mt-2"
              >
                Request Withdrawal
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Floating Button */}
      <button
        onClick={() => setCreateOpen(true)}
        className="fixed bottom-6 right-6 bg-black text-white px-4 py-3 rounded-full"
      >
        Create New Goal
      </button>

      {createOpen && <SavingsCreateModal onClose={() => setCreateOpen(false)} />}
      {withdrawGoal && (
        <WithdrawalModal goal={withdrawGoal} onClose={() => setWithdrawGoal(null)} />
      )}
    </div>
  );
}
