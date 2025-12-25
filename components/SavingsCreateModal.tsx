"use client";

import { useState } from "react";
import api from "@/lib/api";

type Props = {
  onClose: () => void;
  onCreated?: () => void; // optional callback after goal creation
};

export default function SavingsCreateModal({ onClose, onCreated }: Props) {
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState<number>(0);
  const [duration, setDuration] = useState<number>(30); // default 30 days
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || amount <= 0 || duration <= 0) {
      setError("Please fill all fields correctly");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const res = await api.post("/savings/goals", {
        title,
        amount,
        durationDays: duration,
      });

      if (res.data.success) {
        onCreated?.(); // notify parent to reload goals
        onClose();
      } else {
        setError(res.data.message || "Failed to create savings goal");
      }
    } catch (err: any) {
      setError(err.message || "Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Create Savings Goal</h2>

        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm mb-1">Goal Title</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full border rounded px-3 py-2"
              placeholder="e.g., Vacation Fund"
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Target Amount</label>
            <input
              type="number"
              value={amount}
              onChange={e => setAmount(Number(e.target.value))}
              className="w-full border rounded px-3 py-2"
              placeholder="₦"
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Duration (days)</label>
            <input
              type="number"
              value={duration}
              onChange={e => setDuration(Number(e.target.value))}
              className="w-full border rounded px-3 py-2"
            />
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded border text-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded bg-black text-white"
            >
              {loading ? "Creating..." : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
