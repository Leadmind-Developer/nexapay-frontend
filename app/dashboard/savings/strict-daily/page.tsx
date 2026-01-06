"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import dayjs from "dayjs";
import SavingsDailyCreateModal from "@/components/SavingsDailyCreateModal";

type StrictDailyPlan = {
  id: number;
  targetAmount: number; // KOBO
  dailyAmount: number; // KOBO
  currentBalance: number; // KOBO
  durationDays: number;
  startDate: string;
  status: "ACTIVE" | "COMPLETED" | "BROKEN";
};

export default function StrictDailyPage() {
  const [plans, setPlans] = useState<StrictDailyPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);

  const totalSaved = plans.reduce(
    (acc, plan) => acc + plan.currentBalance,
    0
  );

  const activePlans = plans.filter((p) => p.status === "ACTIVE");

  async function fetchPlans() {
    setLoading(true);
    try {
      const res = await api.get("/strict-daily");
      setPlans(res.data.data ?? []);
    } catch (err) {
      console.error("Failed to fetch strict daily plans", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchPlans();
  }, []);

  if (loading) {
    return <div className="p-6">Loading strict daily savings…</div>;
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Strict Daily Savings</h1>
        <span className="text-xs text-red-500 font-medium">
          No interest • First day fee applies
        </span>
      </div>

      {/* SUMMARY */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white shadow rounded-lg p-4">
          <p className="text-sm text-gray-500">Total Contributed</p>
          <p className="text-xl font-semibold mt-2">
            ₦{(totalSaved / 100).toLocaleString()}
          </p>
        </div>

        <div className="bg-white shadow rounded-lg p-4">
          <p className="text-sm text-gray-500">Active Plans</p>
          <p className="text-xl font-semibold mt-2">
            {activePlans.length}
          </p>
        </div>

        <div className="bg-white shadow rounded-lg p-4">
          <p className="text-sm text-gray-500">Interest</p>
          <p className="text-xl font-semibold mt-2">0%</p>
        </div>
      </div>

      {/* PLANS */}
      {plans.length === 0 ? (
        <p className="text-sm text-gray-500">
          No strict daily savings plans yet.
        </p>
      ) : (
        <div className="space-y-4">
          {plans.map((plan) => {
            const progress = Math.min(
              (plan.currentBalance / plan.targetAmount) * 100,
              100
            );

            return (
              <div
                key={plan.id}
                className="bg-white shadow rounded-lg p-4 space-y-3"
              >
                <div className="flex justify-between items-center">
                  <h2 className="font-semibold">
                    Strict Daily Plan #{plan.id}
                  </h2>
                  <span
                    className={`px-2 py-1 text-xs rounded ${
                      plan.status === "ACTIVE"
                        ? "bg-green-100 text-green-700"
                        : plan.status === "COMPLETED"
                        ? "bg-gray-100 text-gray-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {plan.status}
                  </span>
                </div>

                {/* Progress */}
                <div className="h-2 bg-gray-200 rounded overflow-hidden">
                  <div
                    className="h-2 bg-green-500 transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>

                <div className="flex justify-between text-sm text-gray-600">
                  <span>
                    Daily: ₦{(plan.dailyAmount / 100).toLocaleString()}
                  </span>
                  <span>
                    ₦{(plan.currentBalance / 100).toLocaleString()} / ₦
                    {(plan.targetAmount / 100).toLocaleString()}
                  </span>
                </div>

                <div className="text-xs text-gray-500">
                  Start: {dayjs(plan.startDate).format("MMM D, YYYY")}
                </div>

                <div className="text-xs text-red-500 font-medium">
                  First day fee applies
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* FLOATING CTA */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setCreateOpen(true)}
          className="
            px-6 py-3 rounded-full shadow-lg
            bg-green-600 text-white
            hover:scale-105 transition-transform
          "
        >
          Start Strict Daily
        </button>
      </div>

      {/* CREATE MODAL */}
      {createOpen && (
        <SavingsDailyCreateModal
          onClose={() => setCreateOpen(false)}
          onCreated={() => {
            fetchPlans();
          }}
        />
      )}
    </div>
  );
}
