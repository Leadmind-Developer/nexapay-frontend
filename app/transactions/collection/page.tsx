"use client";
import { useState } from "react";
import axios from "axios";

export default function CollectionPage() {
  const [amount, setAmount] = useState<number | "">("");
  const [phone, setPhone] = useState("");
  const [medium, setMedium] = useState<"USSD_PUSH" | "PAYCODE">("USSD_PUSH");
  const [loading, setLoading] = useState(false);
  const [resp, setResp] = useState<any>(null);

  async function submit(e: any) {
    e.preventDefault();
    setLoading(true);
    setResp(null);
    try {
      const payload = { amount: Number(amount), payer_phone: phone || undefined, authentication_medium: medium };
      const r = await axios.post("/api/transactions/collection", payload);
      setResp(r.data);
    } catch (err: any) {
      setResp({ error: err.response?.data ?? err.message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-lg mx-auto bg-white dark:bg-gray-800 p-6 rounded shadow">
      <h2 className="text-xl font-semibold mb-4">Initiate Collection</h2>
      <form onSubmit={submit} className="space-y-3">
        <label>Amount</label>
        <input className="input" type="number" value={amount as any} onChange={(e) => setAmount(e.target.value === "" ? "" : Number(e.target.value))} required />
        <label>Payer Phone (optional)</label>
        <input className="input" value={phone} onChange={(e) => setPhone(e.target.value)} />
        <label>Authentication Medium</label>
        <select className="input" value={medium} onChange={(e) => setMedium(e.target.value as any)}>
          <option value="USSD_PUSH">USSD Push</option>
          <option value="PAYCODE">Paycode</option>
        </select>
        <button className="btn" type="submit" disabled={loading}>{loading ? "Sending..." : "Initiate"}</button>
      </form>

      {resp && <pre className="mt-4 p-3 bg-gray-100 dark:bg-gray-900 rounded">{JSON.stringify(resp, null, 2)}</pre>}
    </div>
  );
}
