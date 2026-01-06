"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api"; // your API helper
import dayjs from "dayjs";

type StrictDailyPlan = {
  id: number;
  targetAmount: number; // in KOBO
  dailyAmount: number; // in KOBO
  currentBalance: number; // in KOBO
  durationDays: number;
  startDate: string;
  status: "ACTIVE" | "COMPLETED" | "BROKEN";
};

export default function StrictDailyPage() {
  const [plans, setPlans] = useState<StrictDailyPlan[]>([]);
  const [loading, setLoading] = useState(true);

  const totalSaved = plans.reduce((acc, plan) => acc + plan.currentBalance, 0);
  const activePlans = plans.filter((plan) => plan.status === "ACTIVE");

  useEffect(() => {
    async function fetchPlans() {
      setLoading(true);
      try {
        const res = await api.get("/strict-daily"); // GET /api/strict-daily
        setPlans(res.data);
      } catch (err) {
        console.error("Failed to fetch strict daily plans", err);
      } finally {
        setLoading(false);
      }
    }
    fetchPlans();
  }, []);

  if (loading) return <div className="p-4">Loading...</div>;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Strict Daily Savings</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white shadow rounded-lg p-4 flex flex-col">
          <span className="text-sm text-gray-500">Total Contributed</span>
          <span className="text-xl font-semibold mt-2">
            ₦{(totalSaved / 100).toLocaleString()}
          </span>
        </div>
        <div className="bg-white shadow rounded-lg p-4 flex flex-col">
          <span className="text-sm text-gray-500">Active Plans</span>
          <span className="text-xl font-semibold mt-2">{activePlans.length}</span>
        </div>
        <div className="bg-white shadow rounded-lg p-4 flex flex-col">
          <span className="text-sm text-gray-500">No Interest</span>
          <span className="text-xl font-semibold mt-2">✓</span>
        </div>
      </div>

      {/* Active Plans */}
      <div className="space-y-4">
        {plans.map((plan) => {
          const progress = Math.min(
            (plan.currentBalance / plan.targetAmount) * 100,
            100
          );

          return (
            <div
              key={plan.id}
              className="bg-white shadow rounded-lg p-4 flex flex-col"
            >
              <div className="flex justify-between items-center mb-2">
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

              {/* Progress Bar */}
              <div className="w-full bg-gray-200 h-3 rounded-full mb-2">
                <div
                  className="h-3 rounded-full bg-green-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Daily Amount: ₦{(plan.dailyAmount / 100).toLocaleString()}</span>
                <span>
                  Saved: ₦{(plan.currentBalance / 100).toLocaleString()} / ₦
                  {(plan.targetAmount / 100).toLocaleString()}
                </span>
              </div>
              <div className="text-xs text-gray-500 mb-1">
                Start: {dayjs(plan.startDate).format("MMM D, YYYY")}
              </div>
              <div className="text-xs text-red-500 font-medium">
                First day fee applies
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
