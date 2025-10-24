"use client"; // Must be the very first line

import React, { useState } from "react";
import SEO from "@/components/SEO";
import { SmartCashAPI, Payload } from "@/lib/api";

export default function BulkPage() {
  const [csvText, setCsvText] = useState("reference,amount,recipient\n");
  const [resp, setResp] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setResp(null);

    try {
      const payload: Payload = { csv: csvText };
      const r = await SmartCashAPI.bulk(payload); // call the proper API
      setResp(r.data); // AxiosResponse.data
    } catch (err: any) {
      setResp({ error: err.response?.data ?? err.message });
    }

    setLoading(false);
  }

  return (
    <div className="container mx-auto p-4">
      <SEO title="Enterprise Bulk Transactions" />
      <h2 className="text-2xl font-bold mb-4">Enterprise Bulk Transactions</h2>

      <form className="flex flex-col gap-3 mb-4" onSubmit={submit}>
        <label className="font-semibold">
          CSV (reference,amount,recipient)
        </label>
        <textarea
          className="border p-2 rounded resize-none"
          value={csvText}
          onChange={(e) => setCsvText(e.target.value)}
          rows={10}
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {loading ? "Submitting..." : "Initiate Bulk"}
        </button>
      </form>

      {resp && (
        <div className="bg-gray-100 p-3 rounded">
          <h3 className="font-semibold mb-2">Response:</h3>
          <pre className="whitespace-pre-wrap">{JSON.stringify(resp, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
