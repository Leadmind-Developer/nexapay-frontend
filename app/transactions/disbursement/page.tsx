"use client";
import { useState } from "react";
import axios from "axios";

export default function DisbursementPage() {
  const [type, setType] = useState<"WALLET" | "BANKACCOUNT">("WALLET");
  const [payee, setPayee] = useState("");
  const [amount, setAmount] = useState<number | "">("");
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [resp, setResp] = useState<any>(null);

  async function submit(e: any) {
    e.preventDefault();
    setLoading(true);
    setResp(null);
    try {
      const payload: any = { type, payee_account: payee, amount: Number(amount), pin };
      const r = await axios.post("/api/transactions/disbursement", payload);
      setResp(r.data);
    } catch (err: any) {
      setResp({ error: err.response?.data ?? err.message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-lg mx-auto bg-white dark:bg-gray-800 p-6 rounded shadow">
      <h2 className="text-xl font-semibold mb-4">Disbursement</h2>

      <form onSubmit={submit} className="space-y-3">
        <label>Type</label>
        <select className="input" value={type} onChange={(e) => setType(e.target.value as any)}>
          <option value="WALLET">Wallet</option>
          <option value="BANKACCOUNT">Bank account</option>
        </select>

        <label>Payee account</label>
        <input className="input" value={payee} onChange={(e) => setPayee(e.target.value)} required />

        <label>Amount</label>
        <input className="input" type="number" value={amount as any} onChange={(e) => setAmount(e.target.value === "" ? "" : Number(e.target.value))} required />

        <label>PIN</label>
        <input className="input" type="password" value={pin} onChange={(e) => setPin(e.target.value)} required />

        <button className="btn" type="submit" disabled={loading}>{loading ? "Processing..." : "Disburse"}</button>
      </form>

      {resp && <pre className="mt-4 p-3 bg-gray-100 dark:bg-gray-900 rounded">{JSON.stringify(resp, null, 2)}</pre>}
    </div>
  );
}
