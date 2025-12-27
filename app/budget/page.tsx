"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";

export default function BudgetPage() {
  const [budget, setBudget] = useState<any>(null);

  useEffect(() => {
    api.get("/budget/current").then(res => setBudget(res.data.budget));
  }, []);

  if (!budget) return <p>No budget set</p>;

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold">Monthly Budget</h1>

      <p>Total: ₦{budget.total}</p>

      <ul>
        {budget.categories.map((c: any) => (
          <li key={c.id} className="flex justify-between">
            <span>{c.category}</span>
            <span>₦{c.limit}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
