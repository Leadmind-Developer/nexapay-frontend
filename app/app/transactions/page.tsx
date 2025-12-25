"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import Link from "next/link";

export default function TransactionsPage() {
  const [txns, setTxns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTxns();
    const interval = setInterval(fetchTxns, 10000);
    return () => clearInterval(interval);
  }, []);

  async function fetchTxns() {
    try {
      const res = await api.get("/transactions");
      setTxns(res.data);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Transactions</h1>

      {loading && <p>Loading…</p>}

      {txns.map(txn => (
        <Link
          key={txn.reference}
          href={`/transactions/${txn.reference}`}
          className="block border rounded p-4 mb-3 hover:bg-gray-50"
        >
          <div className="flex justify-between items-center">
            <div>
              <p className="font-semibold capitalize">{txn.service.replace("_", " ")}</p>
              <p className="text-sm text-gray-500">{txn.reference}</p>
            </div>

            <span
              className={`px-3 py-1 rounded text-xs font-semibold
                ${txn.status === "SUCCESS" && "bg-green-100 text-green-700"}
                ${txn.status === "FAILED" && "bg-red-100 text-red-700"}
                ${txn.status === "PROCESSING" && "bg-yellow-100 text-yellow-700"}
              `}
            >
              {txn.status}
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}
