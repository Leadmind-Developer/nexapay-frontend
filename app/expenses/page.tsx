"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";

type Expense = {
  id: string;
  source: string;
  category: string;
  amount: number;
  description: string;
  createdAt: string;
};

const CATEGORY_COLORS = [
  "bg-blue-100 text-blue-700",
  "bg-green-100 text-green-700",
  "bg-yellow-100 text-yellow-700",
  "bg-purple-100 text-purple-700",
  "bg-pink-100 text-pink-700",
  "bg-red-100 text-red-700",
];

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [total, setTotal] = useState(0);
  const [byCategory, setByCategory] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        const res = await api.get("/expenses/me");
        setExpenses(res.data.expenses);
        setTotal(res.data.total);
        setByCategory(res.data.byCategory);
      } finally {
        setLoading(false);
      }
    };
    fetchExpenses();
  }, []);

  if (loading) return <p className="p-6">Loading expenses…</p>;

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-xl font-bold">Expense Tracker</h1>

      {/* TOTAL CARD */}
      <div className="rounded-xl p-5 text-white shadow bg-gradient-to-r from-indigo-600 to-purple-600">
        <p className="text-sm opacity-90">Total Spent</p>
        <p className="text-3xl font-bold mt-1">
          ₦{total.toLocaleString()}
        </p>
      </div>

      {/* CATEGORY BREAKDOWN */}
      <div className="bg-white rounded-xl p-4 shadow">
        <h2 className="font-semibold mb-3">By Category</h2>

        <ul className="space-y-2">
          {Object.entries(byCategory).map(([cat, amt], i) => (
            <li
              key={cat}
              className="flex justify-between items-center"
            >
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  CATEGORY_COLORS[i % CATEGORY_COLORS.length]
                }`}
              >
                {cat}
              </span>
              <span className="font-semibold">
                ₦{amt.toLocaleString()}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* TRANSACTIONS */}
      <div className="bg-white rounded-xl p-4 shadow">
        <h2 className="font-semibold mb-4">Transactions</h2>

        <ul className="space-y-4">
          {expenses.map(e => (
            <li
              key={e.id}
              className="border rounded-lg p-4 hover:shadow transition"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium">{e.description}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(e.createdAt).toLocaleString()}
                  </p>
                </div>

                <div className="text-right">
                  <p className="font-bold text-red-600">
                    − ₦{e.amount.toLocaleString()}
                  </p>
                  <span className="inline-block mt-1 px-2 py-0.5 text-xs rounded bg-gray-100 text-gray-600">
                    {e.source}
                  </span>
                </div>
              </div>

              <div className="mt-2">
                <span className="text-xs text-gray-600">
                  Category: <b>{e.category}</b>
                </span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
