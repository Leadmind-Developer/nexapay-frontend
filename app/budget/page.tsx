"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import Link from "next/link";

interface Expense {
  category: string;
  amount: number;
}

export default function BudgetPage() {
  const [budget, setBudget] = useState<any>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchBudget = async () => {
      try {
        const res = await api.get("/expenses/current");
        setBudget(res.data?.budget || null);

        const expRes = await api.get("/expenses/me"); // fetch all expenses
        setExpenses(expRes.data?.expenses || []);
      } catch (err: any) {
        setError("Failed to load budget");
      } finally {
        setLoading(false);
      }
    };

    fetchBudget();
  }, []);

  if (loading) return <p className="p-6">Loading...</p>;
  if (error) return <p className="p-6 text-red-600">{error}</p>;

  if (!budget)
    return (
      <div className="p-6 space-y-4">
        <h1 className="text-xl font-bold">Monthly Budget</h1>
        <p className="text-gray-600">No budget set for this month.</p>
        <Link
          href="/budget/setup"
          className="inline-block bg-blue-600 text-white px-4 py-2 rounded font-semibold"
        >
          Set Budget
        </Link>
      </div>
    );

  /* Map expenses by category */
  const spentByCategory: Record<string, number> = {};
  expenses.forEach((e) => {
    spentByCategory[e.category] = (spentByCategory[e.category] || 0) + e.amount;
  });

  return (
    <div className="p-6 space-y-4 max-w-xl mx-auto">
      <h1 className="text-xl font-bold">Monthly Budget</h1>

      <p className="text-lg">
        Total Budget: <b>₦{budget.total.toLocaleString()}</b>
      </p>

      <ul className="divide-y">
        {budget.categories.map((c: any) => {
          const spent = spentByCategory[c.category] || 0;
          const exceeded = spent > c.limit;
          return (
            <li
              key={c.id}
              className={`flex justify-between py-2 text-sm ${
                exceeded ? "bg-red-100" : ""
              }`}
            >
              <span>{c.category}</span>
              <span>
                ₦{spent.toLocaleString()} / ₦{c.limit.toLocaleString()}
                {exceeded && (
                  <span className="ml-2 text-red-600 font-semibold">
                    (Exceeded!)
                  </span>
                )}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
