"use client";

import { useEffect, useState, useMemo } from "react";
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
  phone?: string;
  billersCode?: string;
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pdfZoom, setPdfZoom] = useState(1);

  const processingTxs = useTransactionsSSE();

  /* ---------------- FETCH ---------------- */
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

  /* ---------------- MERGE REALTIME ---------------- */
  useEffect(() => {
    setTransactions((prev) => {
      const nonProcessing = prev.filter((tx) => tx.status !== "PROCESSING");
      return [...nonProcessing, ...processingTxs].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() -
          new Date(a.createdAt).getTime()
      );
    });
  }, [processingTxs]);

  /* ---------------- FILTER ---------------- */
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      const matchesSearch =
        tx.requestId.toLowerCase().includes(search.toLowerCase()) ||
        tx.serviceId.toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        !statusFilter || tx.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [transactions, search, statusFilter]);

  /* ---------------- HELPERS ---------------- */
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard");
  };

  const openModal = (tx: Transaction) => {
    setSelectedTx(tx);
    setPdfUrl(`/transactions/${tx.requestId}/receipt.pdf`);
    setPdfZoom(1);
  };

  const closeModal = () => {
    setSelectedTx(null);
    setPdfUrl(null);
  };

  /* ---------------- RENDER ---------------- */
  return (
    <div className="max-w-4xl mx-auto p-5 space-y-4">
      <h1 className="text-2xl font-bold">Transactions</h1>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          type="text"
          placeholder="Search by reference or service"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 p-2 border rounded bg-white dark:bg-gray-900"
        />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="p-2 border rounded bg-white dark:bg-gray-900"
        >
          <option value="">All statuses</option>
          <option value="SUCCESS">Success</option>
          <option value="PROCESSING">Processing</option>
          <option value="FAILED">Failed</option>
        </select>
      </div>

      {/* List */}
      {loading ? (
        <p>Loading transactions…</p>
      ) : filteredTransactions.length === 0 ? (
        <p>No transactions found.</p>
      ) : (
        filteredTransactions.map((tx) => (
          <div
            key={tx.requestId}
            onClick={() => openModal(tx)}
            className="p-4 border rounded flex justify-between items-center cursor-pointer
                       hover:bg-gray-50 dark:hover:bg-gray-800 transition"
          >
            <div>
              <p className="font-semibold capitalize">
                {tx.serviceId.replace("_", " ")}
              </p>
              <p className="text-sm text-gray-500">
                Ref: {tx.requestId}
              </p>
              <p className="text-sm text-gray-500">
                ₦{tx.amount}
              </p>
            </div>

            <div className="flex gap-2 items-center">
              <span
                className={`px-3 py-1 rounded text-xs font-semibold
                  ${tx.status === "SUCCESS" && "bg-green-100 text-green-700"}
                  ${tx.status === "FAILED" && "bg-red-100 text-red-700"}
                  ${tx.status === "PROCESSING" && "bg-yellow-100 text-yellow-700"}
                `}
              >
                {tx.status}
              </span>

              <button
                className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded text-sm"
                onClick={(e) => {
                  e.stopPropagation();
                  copyToClipboard(tx.requestId);
                }}
              >
                Copy Ref
              </button>
            </div>
          </div>
        ))
      )}

      {/* ---------------- MODAL ---------------- */}
      {selectedTx && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
          onClick={closeModal}
        >
          <div
            className="bg-white dark:bg-gray-900 max-w-3xl w-full rounded-lg p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold">Transaction Details</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Details */}
              <div className="space-y-2">
                <p><strong>Service:</strong> {selectedTx.serviceId}</p>
                <p><strong>Reference:</strong> {selectedTx.requestId}</p>
                <p><strong>Amount:</strong> ₦{selectedTx.amount}</p>
                <p><strong>Status:</strong> {selectedTx.status}</p>
                {selectedTx.phone && <p><strong>Phone:</strong> {selectedTx.phone}</p>}
                {selectedTx.billersCode && (
                  <p><strong>Customer No:</strong> {selectedTx.billersCode}</p>
                )}
                {(selectedTx.apiResponse?.pin || selectedTx.apiResponse?.token) && (
                  <p className="text-indigo-600 font-bold">
                    Token/PIN: {selectedTx.apiResponse.pin || selectedTx.apiResponse.token}
                  </p>
                )}
              </div>

              {/* PDF Preview */}
              <div className="border rounded overflow-auto h-80 relative">
                <div className="sticky top-0 flex justify-end gap-2 p-2 bg-white dark:bg-gray-900">
                  <button
                    onClick={() => setPdfZoom((z) => Math.min(z + 0.2, 3))}
                    className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded"
                  >
                    +
                  </button>
                  <button
                    onClick={() => setPdfZoom((z) => Math.max(z - 0.2, 0.5))}
                    className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded"
                  >
                    −
                  </button>
                  <span className="text-sm">
                    {(pdfZoom * 100).toFixed(0)}%
                  </span>
                </div>

                {pdfUrl ? (
                  <iframe
                    src={pdfUrl}
                    className="w-full h-full"
                    style={{
                      transform: `scale(${pdfZoom})`,
                      transformOrigin: "top left",
                    }}
                  />
                ) : (
                  <p className="p-4 text-gray-500">Loading PDF…</p>
                )}
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                className="flex-1 bg-blue-600 text-white py-2 rounded"
                onClick={() => window.open(pdfUrl || "#", "_blank")}
              >
                Download Receipt
              </button>
              <button
                className="flex-1 bg-gray-200 dark:bg-gray-700 py-2 rounded"
                onClick={closeModal}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
