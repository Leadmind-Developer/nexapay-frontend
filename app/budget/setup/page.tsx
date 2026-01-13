"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { useRouter } from "next/navigation";

interface Category {
  category: string;
  limit: number;
}

export default function BudgetSetupPage() {
  const router = useRouter();
  const [total, setTotal] = useState<number>(0);
  const [categories, setCategories] = useState<Category[]>([
    { category: "Food", limit: 0 },
    { category: "Transport", limit: 0 },
    { category: "Utilities", limit: 0 },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCategoryChange = (index: number, field: string, value: string) => {
    const newCategories = [...categories];
    if (field === "category") newCategories[index].category = value;
    if (field === "limit") newCategories[index].limit = Number(value);
    setCategories(newCategories);
  };

  const addCategory = () => setCategories([...categories, { category: "", limit: 0 }]);
  const removeCategory = (index: number) => {
    const newCategories = [...categories];
    newCategories.splice(index, 1);
    setCategories(newCategories);
  };

  const handleSubmit = async () => {
    if (total <= 0) return setError("Total budget must be greater than 0");
    if (categories.some((c) => !c.category || c.limit <= 0))
      return setError("All categories must have a name and positive limit");

    setLoading(true);
    setError("");

    try {
      const now = new Date();
      await api.post("/expenses", {
        month: now.getMonth() + 1,
        year: now.getFullYear(),
        total,
        categories,
      });
      router.push("/budget");
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to save budget");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-4 max-w-xl mx-auto">
      <h1 className="text-xl font-bold">Set Monthly Budget</h1>

      {error && <p className="text-red-600">{error}</p>}

      <div className="space-y-2">
        <label className="font-semibold">Total Budget</label>
        <input
          type="number"
          value={total}
          onChange={(e) => setTotal(Number(e.target.value))}
          className="w-full p-2 border rounded"
        />
      </div>

      <h2 className="text-lg font-semibold mt-4">Categories</h2>
      {categories.map((c, idx) => (
        <div key={idx} className="flex space-x-2 items-center mb-2">
          <input
            type="text"
            placeholder="Category"
            value={c.category}
            onChange={(e) => handleCategoryChange(idx, "category", e.target.value)}
            className="flex-1 p-2 border rounded"
          />
          <input
            type="number"
            placeholder="Limit"
            value={c.limit}
            onChange={(e) => handleCategoryChange(idx, "limit", e.target.value)}
            className="w-32 p-2 border rounded"
          />
          {categories.length > 1 && (
            <button
              onClick={() => removeCategory(idx)}
              className="bg-red-500 text-white px-2 py-1 rounded"
            >
              X
            </button>
          )}
        </div>
      ))}

      <button
        onClick={addCategory}
        className="bg-gray-200 px-3 py-1 rounded font-semibold"
      >
        + Add Category
      </button>

      <button
        onClick={handleSubmit}
        className="bg-blue-600 text-white px-4 py-2 rounded font-semibold block mt-4"
        disabled={loading}
      >
        {loading ? "Saving..." : "Save Budget"}
      </button>
    </div>
  );
}
