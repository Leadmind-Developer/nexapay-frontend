"use client";

import { useState } from "react";
import axios from "axios";

type CashOutType = "BANKACCOUNT" | "WALLET";

interface CashOutPayload {
  type: CashOutType;
  amount: number;
  account_id?: string;
  branch_code?: string;
  wallet_id?: string;
}

export default function CashOutForm() {
  const [type, setType] = useState<CashOutType>("BANKACCOUNT");
  const [amount, setAmount] = useState<number | "">("");
  const [accountId, setAccountId] = useState("");
  const [branchCode, setBranchCode] = useState("");
  const [walletId, setWalletId] = useState("");
  const [loading, setLoading] = useState(false);
  const [resp, setResp] = useState<any>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setResp(null);

    try {
      const payload: CashOutPayload = { type, amount: Number(amount) };
      if (type === "BANKACCOUNT") {
        payload.account_id = accountId;
        payload.branch_code = branchCode;
      } else {
        payload.wallet_id = walletId;
      }

      const r = await axios.post("/api/transactions/cashout", payload);
      setResp(r.data);

      // optional: reset form
      if (!r.data?.error) {
        setAmount("");
        setAccountId("");
        setBranchCode("");
        setWalletId("");
      }
    } catch (err: any) {
      setResp({ error: err.response?.data ?? err.message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-xl mx-auto bg-white dark:bg-gray-800 p-6 rounded shadow">
      <h2 className="text-xl font-semibold mb-4">Cash Out</h2>
      <form onSubmit={submit} className="space-y-3">
        <label className="block">Type</label>
        <select
          className="w-full p-2 border rounded"
          value={type}
          onChange={(e) => setType(e.target.value as CashOutType)}
        >
          <option value="BANKACCOUNT">Bank Account</option>
          <option value="WALLET">Wallet</option>
        </select>

        <div>
          <label className="block">Amount</label>
          <input
            className="w-full p-2 border rounded"
            type="number"
            value={amount === "" ? "" : amount}
            onChange={(e) =>
              setAmount(e.target.value === "" ? "" : Number(e.target.value))
            }
            required
          />
        </div>

        {type === "BANKACCOUNT" ? (
          <>
            <label>Account ID</label>
            <input
              className="w-full p-2 border rounded"
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
              required
            />
            <label>Branch Code</label>
            <input
              className="w-full p-2 border rounded"
              value={branchCode}
              onChange={(e) => setBranchCode(e.target.value)}
              required
            />
          </>
        ) : (
          <>
            <label>Wallet ID</label>
            <input
              className="w-full p-2 border rounded"
              value={walletId}
              onChange={(e) => setWalletId(e.target.value)}
              required
            />
          </>
        )}

        <button
          className="w-full px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-400 transition"
          type="submit"
          disabled={loading}
        >
          {loading ? "Processing..." : "Submit"}
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
