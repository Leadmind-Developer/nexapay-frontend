"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { useTransactionsSSE } from "@/hooks/useTransactionsSSE";

interface Transaction {
  requestId: string;
  serviceId: string;
  status: "SUCCESS" | "FAILED" | "PROCESSING" | string;
  amount: number;
  apiResponse?: {
    pin?: string;
    token?: string;
  };
  createdAt: string;
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const processingTxs = useTransactionsSSE();

  // Initial fetch
  useEffect(() => {
    fetchTransactions();
  }, []);

  async function fetchTransactions() {
    try {
      const res = await api.get("/transactions");
      setTransactions(res.data);
    } catch (err) {
      console.error("Failed to fetch transactions:", err);
    } finally {
      setLoading(false);
    }
  }

  // Merge real-time processing updates
  useEffect(() => {
    setTransactions((prev) => {
      const nonProcessing = prev.filter((tx) => tx.status !== "PROCESSING");
      return [...nonProcessing, ...processingTxs].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    });
  }, [processingTxs]);

  // Filtered + searched transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      const matchesSearch =
        tx.requestId.toLowerCase().includes(search.toLowerCase()) ||
        tx.serviceId.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = !statusFilter || tx.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [transactions, search, statusFilter]);

  return (
    <div className="max-w-4xl mx-auto p-5 space-y-4">
      <h1 className="text-2xl font-bold mb-4">Transactions</h1>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <input
          type="text"
          placeholder="Search by reference or service"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 p-2 border rounded"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="p-2 border rounded"
        >
          <option value="">All statuses</option>
          <option value="SUCCESS">Success</option>
          <option value="PROCESSING">Processing</option>
          <option value="FAILED">Failed</option>
        </select>
      </div>

      {loading ? (
        <p>Loading transactions…</p>
      ) : filteredTransactions.length === 0 ? (
        <p>No transactions found.</p>
      ) : (
        filteredTransactions.map((tx) => (
          <div
            key={tx.requestId}
            className="p-4 border rounded flex justify-between items-center hover:bg-gray-50 dark:hover:bg-gray-800 transition"
          >
            <div>
              <p className="font-semibold capitalize">{tx.serviceId.replace("_", " ")}</p>
              <p className="text-sm text-gray-500">Reference: {tx.requestId}</p>
              <p className="text-sm text-gray-500">₦{tx.amount}</p>
            </div>

            <div className="flex gap-2 items-center">
              {/* Status badge */}
              <span
                className={`px-3 py-1 rounded text-xs font-semibold
                  ${tx.status === "SUCCESS" ? "bg-green-100 text-green-700" : ""}
                  ${tx.status === "FAILED" ? "bg-red-100 text-red-700" : ""}
                  ${tx.status === "PROCESSING" ? "bg-yellow-100 text-yellow-700" : ""}
                `}
              >
                {tx.status}
              </span>

              {/* Copy reference */}
              <button
                className="bg-gray-200 px-2 py-1 rounded text-sm"
                onClick={() => navigator.clipboard.writeText(tx.requestId)}
              >
                Copy Ref
              </button>

              {/* Copy PIN/Token for electricity & education */}
              {["education", "electricity"].includes(tx.serviceId.toLowerCase()) &&
                (tx.apiResponse?.pin || tx.apiResponse?.token) && (
                  <button
                    className="bg-gray-200 px-2 py-1 rounded text-sm"
                    onClick={() =>
                      navigator.clipboard.writeText(tx.apiResponse?.pin || tx.apiResponse?.token || "")
                    }
                  >
                    Copy PIN / Token
                  </button>
                )}

              {/* Download receipt */}
              <button
                className="bg-gray-200 px-2 py-1 rounded text-sm"
                onClick={() =>
                  window.open(`/transactions/${tx.requestId}/receipt.pdf`, "_blank")
                }
              >
                Download Receipt
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
