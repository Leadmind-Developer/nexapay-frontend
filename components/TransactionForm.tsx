"use client";

import { useState, useEffect } from "react";

interface Props {
  provider: "SmartCash" | "VTpass";
}

type Service = "AIRTIME" | "DATA" | "ELECTRICITY" | "CABLE";

interface Transaction {
  id: string;
  service: Service;
  account: string;
  amount: number;
  status: string;
  createdAt: string;
}

const servicesMap: Record<string, Service[]> = {
  SmartCash: ["AIRTIME", "DATA", "ELECTRICITY", "CABLE"],
  VTpass: ["AIRTIME", "DATA", "ELECTRICITY", "CABLE"],
};

const TransactionForm = ({ provider }: Props) => {
  const [service, setService] = useState<Service>("AIRTIME");
  const [account, setAccount] = useState("");
  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState("");
  const [history, setHistory] = useState<Transaction[]>([]);

  // Load transaction history on mount
  useEffect(() => {
    fetchHistory();
  }, [provider]);

  const fetchHistory = async () => {
    try {
      const res = await fetch(`/api/${provider.toLowerCase()}/history`);
      const data = await res.json();
      setHistory(data);
    } catch (err) {
      console.error("Failed to fetch history:", err);
    }
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setStatus("Processing...");

    try {
      const payload: any = { accountNo: account, amount: Number(amount), service };

      // Add extra fields per service
      if (service === "DATA") payload.dataPlanCode = "DEFAULT_PLAN";
      if (service === "AIRTIME") payload.paymentId = `txn-${Date.now()}`;

      const res = await fetch(`/api/${provider.toLowerCase()}/pay`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (res.ok) {
        setStatus(`✅ Transaction successful! Ref: ${result.request_id || result.id || "N/A"}`);
        fetchHistory();
      } else {
        setStatus(`❌ Transaction failed: ${result.error || "Unknown error"}`);
      }
    } catch (err: any) {
      setStatus(`❌ Transaction failed: ${err.message}`);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-10">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow space-y-4">
        <h2 className="text-xl font-bold mb-2">{provider} Transaction</h2>

        <div>
          <label className="block mb-1 font-semibold">Service</label>
          <select
            value={service}
            onChange={(e) => setService(e.target.value as Service)}
            className="w-full border p-2 rounded"
          >
            {servicesMap[provider].map((s) => (
              <option key={s} value={s}>
                {s.charAt(0) + s.slice(1).toLowerCase()}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block mb-1 font-semibold">Account / Phone / Meter</label>
          <input
            value={account}
            onChange={(e) => setAccount(e.target.value)}
            type="text"
            required
            className="w-full border p-2 rounded"
          />
        </div>

        <div>
          <label className="block mb-1 font-semibold">Amount</label>
          <input
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            type="number"
            required
            className="w-full border p-2 rounded"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 transition"
        >
          Pay
        </button>
        {status && <p className="mt-4 text-center">{status}</p>}
      </form>

      {/* Transaction History */}
      <div>
        <h3 className="text-xl font-bold mb-4 text-center">Transaction History</h3>
        {history.length === 0 ? (
          <p className="text-center text-gray-500">No transactions yet</p>
        ) : (
          <div className="space-y-2">
            {history.map((h) => (
              <div key={h.id} className="flex justify-between bg-gray-100 p-3 rounded shadow-sm">
                <div>
                  <p className="font-semibold">{h.service}</p>
                  <p className="text-sm">{h.account}</p>
                </div>
                <div className="text-right">
                  <p>₦{h.amount}</p>
                  <p className={`text-sm ${h.status === "SUCCESS" ? "text-green-600" : "text-red-600"}`}>
                    {h.status}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionForm;
