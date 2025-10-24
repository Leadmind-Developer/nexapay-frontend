"use client";

import { useState } from "react";
import { initiateBulk } from "@/lib/api";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Enterprise Bulk | NexaApp",
  description: "Initiate and manage enterprise bulk transactions on NexaApp.",
};

export default function EnterprisePage() {
  const [csvText, setCsvText] = useState("reference,amount,recipient\n");
  const [resp, setResp] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setResp(null);

    try {
      const payload = { csv: csvText };
      const r = await initiateBulk(payload);
      setResp(r);
    } catch (err: any) {
      console.error(err);
      setResp({ error: err.response?.data ?? err.message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-semibold">Enterprise Bulk Transactions</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          CSV (reference, amount, recipient)
        </label>

        <textarea
          value={csvText}
          onChange={(e) => setCsvText(e.target.value)}
          rows={10}
          className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 p-3 text-sm font-mono focus:ring-2 focus:ring-blue-500"
        />

        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-400 transition"
        >
          {loading ? "Submitting..." : "Initiate Bulk"}
        </button>
      </form>

      {resp && (
        <pre className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-auto text-sm">
          {JSON.stringify(resp, null, 2)}
        </pre>
      )}
    </div>
  );
}
