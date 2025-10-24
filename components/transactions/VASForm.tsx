"use client";

import { useState } from "react";
import axios from "axios";

export default function VASForm() {
  const [type, setType] = useState<"STATIC" | "DYNAMIC">("STATIC");
  const [constAmount, setConstAmount] = useState<number | "">("");
  const [minAmount, setMinAmount] = useState<number | "">("");
  const [maxAmount, setMaxAmount] = useState<number | "">("");
  const [metadata, setMetadata] = useState("{}");
  const [resp, setResp] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setResp(null);

    try {
      const body: any = { type };
      if (type === "STATIC") body.constant_amount = Number(constAmount);
      else {
        body.min_amount = Number(minAmount);
        body.max_amount = Number(maxAmount);
      }
      body.metadata = JSON.parse(metadata || "{}");

      const r = await axios.post("/api/transactions/vas", body);
      setResp(r.data);
    } catch (err: any) {
      setResp({ error: err.response?.data ?? err.message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-lg mx-auto bg-white dark:bg-gray-800 p-6 rounded shadow">
      <h2 className="text-xl font-semibold mb-4">VAS / Virtual Account</h2>

      <form onSubmit={submit} className="space-y-3">
        <label>Type</label>
        <select
          className="input"
          value={type}
          onChange={(e) => setType(e.target.value as any)}
        >
          <option value="STATIC">STATIC</option>
          <option value="DYNAMIC">DYNAMIC</option>
        </select>

        {type === "STATIC" ? (
          <input
            className="input"
            type="number"
            placeholder="Constant amount"
            value={constAmount as any}
            onChange={(e) =>
              setConstAmount(e.target.value === "" ? "" : Number(e.target.value))
            }
          />
        ) : (
          <>
            <input
              className="input"
              type="number"
              placeholder="Min amount"
              value={minAmount as any}
              onChange={(e) =>
                setMinAmount(e.target.value === "" ? "" : Number(e.target.value))
              }
            />
            <input
              className="input"
              type="number"
              placeholder="Max amount"
              value={maxAmount as any}
              onChange={(e) =>
                setMaxAmount(e.target.value === "" ? "" : Number(e.target.value))
              }
            />
          </>
        )}

        <label>Metadata (JSON)</label>
        <textarea
          className="input"
          rows={4}
          value={metadata}
          onChange={(e) => setMetadata(e.target.value)}
        />

        <button
          className="btn"
          type="submit"
          disabled={loading}
        >
          {loading ? "Creating..." : "Create VAN"}
        </button>
      </form>

      {resp && (
        <pre className="mt-4 p-3 bg-gray-100 dark:bg-gray-900 rounded">
          {JSON.stringify(resp, null, 2)}
        </pre>
      )}
    </div>
  );
}
