"use client";

import { useEffect, useMemo, useState } from "react";
import api from "@/lib/api";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type Expense = {
  id: string;
  source: string;
  category: string;
  amount: number;
  description: string;
  createdAt: string;
};

type PieItem = {
  name: string;
  value: number;
};

const PIE_COLORS = [
  "#6366F1",
  "#22C55E",
  "#F59E0B",
  "#A855F7",
  "#EC4899",
  "#EF4444",
];

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  /* FILTERS */
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [category, setCategory] = useState("");

  useEffect(() => {
    const fetchExpenses = async () => {
      const res = await api.get("/expenses/me");
      setExpenses(res.data.expenses);
      setLoading(false);
    };
    fetchExpenses();
  }, []);

  /* ---------------- FILTERED DATA ---------------- */
  const filteredExpenses = useMemo(() => {
    return expenses.filter(e => {
      const date = new Date(e.createdAt).getTime();

      if (from && date < new Date(from).getTime()) return false;
      if (to && date > new Date(to).getTime()) return false;
      if (category && e.category !== category) return false;

      return true;
    });
  }, [expenses, from, to, category]);

  /* ---------------- TOTALS ---------------- */
  const total = filteredExpenses.reduce((s, e) => s + e.amount, 0);

  const todayTotal = filteredExpenses.reduce((s, e) => {
    const d = new Date(e.createdAt);
    const today = new Date();
    if (d.toDateString() === today.toDateString()) {
      return s + e.amount;
    }
    return s;
  }, 0);

  const weekTotal = filteredExpenses.reduce((s, e) => {
    const d = new Date(e.createdAt);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    if (diff <= 7 * 24 * 60 * 60 * 1000) {
      return s + e.amount;
    }
    return s;
  }, 0);

  /* ---------------- CATEGORY → PIE ---------------- */
  const pieData: PieItem[] = useMemo(() => {
    const map: Record<string, number> = {};
    for (const e of filteredExpenses) {
      map[e.category] = (map[e.category] || 0) + e.amount;
    }

    return Object.entries(map).map(
      ([name, value]): PieItem => ({ name, value })
    );
  }, [filteredExpenses]);

  const categories = [...new Set(expenses.map(e => e.category))];

  if (loading) return <p className="p-6">Loading expenses…</p>;

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-xl font-bold">Expense Tracker</h1>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Stat title="Total Spent" value={total} gradient />
        <Stat title="Today" value={todayTotal} />
        <Stat title="Last 7 Days" value={weekTotal} />
      </div>

      {/* FILTERS */}
      <div className="bg-white p-4 rounded-xl shadow flex flex-wrap gap-4">
        <input
          type="date"
          value={from}
          onChange={e => setFrom(e.target.value)}
          className="border rounded px-3 py-2 text-sm"
        />
        <input
          type="date"
          value={to}
          onChange={e => setTo(e.target.value)}
          className="border rounded px-3 py-2 text-sm"
        />
        <select
          value={category}
          onChange={e => setCategory(e.target.value)}
          className="border rounded px-3 py-2 text-sm"
        >
          <option value="">All categories</option>
          {categories.map(c => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {/* PIE CHART */}
      {pieData.length > 0 && (
        <div className="bg-white p-4 rounded-xl shadow">
          <h2 className="font-semibold mb-2">Spending by Category</h2>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={4}
                >
                  {pieData.map((_, i) => (
                    <Cell
                      key={i}
                      fill={PIE_COLORS[i % PIE_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* TRANSACTIONS */}
      <div className="bg-white rounded-xl p-4 shadow">
        <h2 className="font-semibold mb-4">Transactions</h2>

        <ul className="space-y-4">
          {filteredExpenses.map(e => (
            <li
              key={e.id}
              className="border rounded-lg p-4 hover:shadow transition"
            >
              <div className="flex justify-between">
                <div>
                  <p className="font-medium">{e.description}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(e.createdAt).toLocaleString()}
                  </p>
                </div>
                <p className="font-bold text-red-600">
                  − ₦{e.amount.toLocaleString()}
                </p>
              </div>
              <p className="text-xs mt-1 text-gray-600">
                {e.category} • {e.source}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/* ---------- SMALL STAT CARD ---------- */
function Stat({
  title,
  value,
  gradient,
}: {
  title: string;
  value: number;
  gradient?: boolean;
}) {
  return (
    <div
      className={`p-4 rounded-xl shadow ${
        gradient
          ? "text-white bg-gradient-to-r from-indigo-600 to-purple-600"
          : "bg-white"
      }`}
    >
      <p className="text-sm opacity-80">{title}</p>
      <p className="text-2xl font-bold mt-1">
        ₦{value.toLocaleString()}
      </p>
    </div>
  );
}
