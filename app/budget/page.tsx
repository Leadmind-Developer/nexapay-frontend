"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import Link from "next/link";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
} from "recharts";

const COLORS = ["#4B7BE5", "#F59E0B", "#10B981", "#EF4444", "#6366F1"];

export default function BudgetPage() {
  const [budget, setBudget] = useState<any>(null);
  const [expenses, setExpenses] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get("/expenses/current");
        setBudget(res.data?.budget || null);
        setExpenses(res.data?.expenses || null);
      } catch {
        setError("Failed to load budget");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  /* ---------------- LOADING ---------------- */
  if (loading) return <p className="p-6">Loading budget…</p>;

  /* ---------------- ERROR ---------------- */
  if (error) return <p className="p-6 text-red-600">{error}</p>;

  /* ---------------- EMPTY ---------------- */
  if (!budget) {
    return (
      <div className="p-6 space-y-4">
        <h1 className="text-xl font-bold">Monthly Budget</h1>
        <p className="text-gray-600">
          You haven’t set a budget for this month yet.
        </p>
        <Link
          href="/budget/setup"
          className="inline-block bg-blue-600 text-white px-4 py-2 rounded font-semibold"
        >
          Set Budget
        </Link>
      </div>
    );
  }

  /* ---------------- CALCULATIONS ---------------- */
  const totalSpent = expenses?.total || 0;
  const utilization = Math.min(
    Math.round((totalSpent / budget.total) * 100),
    100
  );

  const warning =
    utilization >= 100
      ? "danger"
      : utilization >= 80
      ? "warning"
      : null;

  const categoryData = budget.categories.map((c: any) => ({
    name: c.category,
    budget: c.limit,
    spent: expenses?.byCategory?.[c.category] || 0,
  }));

  const pieData = categoryData.map((c) => ({
    name: c.name,
    value: c.spent,
  }));

  /* ---------------- UI ---------------- */
  return (
    <div className="p-6 space-y-8">
      <h1 className="text-xl font-bold">Monthly Budget</h1>

      {/* SUMMARY */}
      <div className="bg-white rounded-lg p-4 shadow space-y-2">
        <p className="text-sm text-gray-600">Total Budget</p>
        <p className="text-2xl font-bold">₦{budget.total.toLocaleString()}</p>

        <p className="text-sm text-gray-600">Total Spent</p>
        <p className="text-xl font-semibold">
          ₦{totalSpent.toLocaleString()}
        </p>

        <div className="mt-2">
          <div className="h-2 bg-gray-200 rounded">
            <div
              className={`h-2 rounded ${
                warning === "danger"
                  ? "bg-red-500"
                  : warning === "warning"
                  ? "bg-yellow-400"
                  : "bg-green-500"
              }`}
              style={{ width: `${utilization}%` }}
            />
          </div>

          <p
            className={`mt-1 text-sm font-medium ${
              warning === "danger"
                ? "text-red-600"
                : warning === "warning"
                ? "text-yellow-600"
                : "text-green-600"
            }`}
          >
            {utilization}% used
          </p>

          {warning === "warning" && (
            <p className="text-yellow-700 text-sm">
              ⚠️ You’ve used over 80% of your budget
            </p>
          )}

          {warning === "danger" && (
            <p className="text-red-700 text-sm font-semibold">
              🚨 Budget exceeded
            </p>
          )}
        </div>
      </div>

      {/* BAR CHART */}
      <div className="bg-white rounded-lg p-4 shadow">
        <h2 className="font-semibold mb-4">Budget vs Actual (by category)</h2>

        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={categoryData}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="budget" fill="#CBD5E1" />
            <Bar dataKey="spent" fill="#4B7BE5" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* PIE CHART */}
      <div className="bg-white rounded-lg p-4 shadow">
        <h2 className="font-semibold mb-4">Spending Distribution</h2>

        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={pieData}
              dataKey="value"
              nameKey="name"
              outerRadius={90}
              label
            >
              {pieData.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
