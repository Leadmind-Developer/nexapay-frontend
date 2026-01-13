"use client";

import { useEffect, useMemo, useState } from "react";
import api from "@/lib/api";
import Link from "next/link";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Title,
} from "chart.js";
import { Bar, Pie, Line } from "react-chartjs-2";

/* ---------------- REGISTER CHARTJS ---------------- */
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Title
);

/* ---------------- TYPES ---------------- */

type BudgetCategory = {
  id: number;
  category: string;
  limit: number;
};

type Budget = {
  total: number;
  categories: BudgetCategory[];
};

type Expense = {
  amount: number;
  category: string;
  createdAt: string;
};

type ExpensesSummary = {
  total: number;
  byCategory: Record<string, number>;
  expenses: Expense[];
};

const COLORS = ["#4B7BE5", "#F59E0B", "#10B981", "#EF4444", "#6366F1"];

export default function BudgetPage() {
  const [budget, setBudget] = useState<Budget | null>(null);
  const [expenses, setExpenses] = useState<ExpensesSummary | null>(null);
  const [month, setMonth] = useState<number>(new Date().getMonth() + 1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* ---------------- FETCH ---------------- */
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await api.get("/expenses/current", { params: { month } });
        setBudget(res.data?.budget || null);
        setExpenses(res.data || null);
      } catch {
        setError("Failed to load budget");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [month]);

  if (loading) return <p className="p-6">Loading budget…</p>;
  if (error) return <p className="p-6 text-red-600">{error}</p>;

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
  const totalSpent = expenses?.total ?? 0;
  const utilization = Math.min(Math.round((totalSpent / budget.total) * 100), 100);
  const warning =
    utilization >= 100
      ? "danger"
      : utilization >= 80
      ? "warning"
      : null;

  const categoryData = budget.categories.map(c => ({
    name: c.category,
    budget: c.limit,
    spent: expenses?.byCategory?.[c.category] ?? 0,
  }));

  /* ---------------- CHART DATA ---------------- */

  const barChartData = {
    labels: categoryData.map(c => c.name),
    datasets: [
      {
        label: "Budget",
        data: categoryData.map(c => c.budget),
        backgroundColor: "#CBD5E1",
      },
      {
        label: "Spent",
        data: categoryData.map(c => c.spent),
        backgroundColor: "#4B7BE5",
      },
    ],
  };

  const pieChartData = {
    labels: categoryData.map(c => c.name),
    datasets: [
      {
        data: categoryData.map(c => c.spent),
        backgroundColor: COLORS,
      },
    ],
  };

  const trendData = useMemo(() => {
    if (!expenses?.expenses) return { labels: [], datasets: [] };
    const map: Record<string, number> = {};
    expenses.expenses.forEach(e => {
      const d = new Date(e.createdAt).toISOString().slice(0, 10);
      map[d] = (map[d] || 0) + e.amount;
    });
    const sortedDates = Object.keys(map).sort();
    return {
      labels: sortedDates.slice(-30),
      datasets: [
        {
          label: "Daily Spend",
          data: sortedDates.slice(-30).map(d => map[d]),
          borderColor: "#4B7BE5",
          backgroundColor: "#4B7BE533",
          fill: true,
          tension: 0.3,
        },
      ],
    };
  }, [expenses]);

  /* ---------------- UI ---------------- */
  return (
    <div className="p-6 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold">Monthly Budget</h1>

        {/* MONTH SELECTOR */}
        <select
          value={month}
          onChange={e => setMonth(Number(e.target.value))}
          className="border rounded px-3 py-2 text-sm"
        >
          {Array.from({ length: 12 }).map((_, i) => (
            <option key={i} value={i + 1}>
              {new Date(0, i).toLocaleString("default", { month: "long" })}
            </option>
          ))}
        </select>
      </div>

      {/* SUMMARY */}
      <div className="bg-white rounded-lg p-4 shadow space-y-2">
        <p className="text-sm text-gray-600">Total Budget</p>
        <p className="text-2xl font-bold">₦{budget.total.toLocaleString()}</p>
        <p className="text-sm text-gray-600">Total Spent</p>
        <p className="text-xl font-semibold">₦{totalSpent.toLocaleString()}</p>

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
        </div>
      </div>

      {/* BUDGET VS ACTUAL */}
      <div className="bg-white rounded-lg p-4 shadow">
        <h2 className="font-semibold mb-4">Budget vs Actual</h2>
        <Bar data={barChartData} options={{ responsive: true, plugins: { legend: { position: "top" } } }} />
      </div>

      {/* TREND */}
      <div className="bg-white rounded-lg p-4 shadow">
        <h2 className="font-semibold mb-4">Spending Trend (Last 30 days)</h2>
        <Line data={trendData} options={{ responsive: true, plugins: { legend: { display: false } } }} />
      </div>

      {/* PIE */}
      <div className="bg-white rounded-lg p-4 shadow">
        <h2 className="font-semibold mb-4">Spending Distribution</h2>
        <Pie data={pieChartData} options={{ responsive: true, plugins: { legend: { position: "bottom" } } }} />
      </div>
    </div>
  );
}
