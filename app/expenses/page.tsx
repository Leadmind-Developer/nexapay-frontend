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

  if (loading) return <p>Loading expenses...</p>;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-xl font-bold">Expense Tracker</h1>

      <div className="bg-black text-white p-4 rounded">
        <p className="text-sm">Total Spent</p>
        <p className="text-2xl font-bold">₦{total.toLocaleString()}</p>
      </div>

      <div>
        <h2 className="font-semibold mb-2">By Category</h2>
        <ul className="space-y-1">
          {Object.entries(byCategory).map(([cat, amt]) => (
            <li key={cat} className="flex justify-between">
              <span>{cat}</span>
              <span>₦{amt.toLocaleString()}</span>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h2 className="font-semibold mb-2">Transactions</h2>
        <ul className="space-y-3">
          {expenses.map(e => (
            <li key={e.id} className="border p-3 rounded">
              <div className="flex justify-between">
                <span className="font-medium">{e.description}</span>
                <span className="font-semibold">₦{e.amount}</span>
              </div>
              <p className="text-xs text-gray-500">
                {new Date(e.createdAt).toLocaleString()} • {e.category}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
