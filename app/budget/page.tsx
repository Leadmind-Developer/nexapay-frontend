"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import Link from "next/link";

export default function BudgetPage() {
  const [budget, setBudget] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchBudget = async () => {
      try {
        const res = await api.get("/expenses/current");
        setBudget(res.data?.budget || null);
      } catch (err: any) {
        setError("Failed to load budget");
      } finally {
        setLoading(false);
      }
    };

    fetchBudget();
  }, []);

  /* ---------------- LOADING ---------------- */
  if (loading) {
    return <p className="p-6">Loading budget…</p>;
  }

  /* ---------------- ERROR ---------------- */
  if (error) {
    return <p className="p-6 text-red-600">{error}</p>;
  }

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

  /* ---------------- BUDGET EXISTS ---------------- */
  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-bold">Monthly Budget</h1>

      <p className="text-lg">
        Total: <b>₦{budget.total.toLocaleString()}</b>
      </p>

      <ul className="divide-y">
        {budget.categories.map((c: any) => (
          <li
            key={c.id}
            className="flex justify-between py-2 text-sm"
          >
            <span>{c.category}</span>
            <span>₦{c.limit.toLocaleString()}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
