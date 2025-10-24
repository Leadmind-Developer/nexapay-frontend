"use client";
import { useState } from "react";
import axios from "axios";

export default function RemittancePage() {
  const [payload, setPayload] = useState('{"payer":{},"payee":{},"amount":1000}');
  const [loading, setLoading] = useState(false);
  const [resp, setResp] = useState<any>(null);

  async function submit(e: any) {
    e.preventDefault();
    setLoading(true);
    setResp(null);
    try {
      const body = JSON.parse(payload);
      const r = await axios.post("/api/transactions/remittance", body);
      setResp(r.data);
    } catch (err: any) {
      setResp({ error: err.response?.data ?? err.message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 p-6 rounded shadow">
      <h2 className="text-xl font-semibold mb-4">Remittance</h2>

      <form onSubmit={submit} className="space-y-3">
        <label>Raw JSON payload</label>
        <textarea className="input font-mono" rows={8} value={payload} onChange={(e) => setPayload(e.target.value)} />
        <button className="btn" type="submit" disabled={loading}>{loading ? "Sending..." : "Send Remittance"}</button>
      </form>

      {resp && <pre className="mt-4 p-3 bg-gray-100 dark:bg-gray-900 rounded">{JSON.stringify(resp, null, 2)}</pre>}
    </div>
  );
}
