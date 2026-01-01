"use client";

import { useEffect, useState, useMemo } from "react";
import api from "@/lib/api";
import { useTransactionsSSE } from "@/hooks/useTransactionsSSE";
import { API_BASE } from "@/lib/constants";
import {
  formatTransactionTime,
  formatToken,
  shareViaWhatsApp,
  groupTransactionsByDate,
} from "@/lib/utils/transactions";

/* ================= TYPES ================= */

export interface TransactionItem {
  requestId: string;
  serviceId: string;
  status: "SUCCESS" | "FAILED" | "PROCESSING" | string;
  amount: number;  
  createdAt: string;
  phone?: string;
  billersCode?: string;
  apiResponse?: {
    pin?: string;
    token?: string;
    units?: string | number;
    unitLabel?: string; // "kWh"
  };
  meta?: {
    token?: string;
    units?: string | number;
    unitLabel?: string;
}

function isValidTransaction(obj: any): obj is TransactionItem {
  return (
    obj &&
    typeof obj.requestId === "string" &&
    typeof obj.serviceId === "string" &&
    typeof obj.status === "string" &&
    typeof obj.amount === "number" &&
    typeof obj.createdAt === "string"
  );
}

/* ================= PAGE ================= */

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedTx, setSelectedTx] = useState<TransactionItem | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [highlighted, setHighlighted] = useState<Set<string>>(new Set());

  const sseTransactions = useTransactionsSSE();

  /* ================= FETCH ================= */

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get("/transactions");
        if (Array.isArray(res.data)) {
          setTransactions(
            res.data.filter(isValidTransaction).sort(sortByDateDesc)
          );
        }
      } catch (err) {
        console.error("Failed to fetch transactions", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /* ================= REALTIME ================= */

  useEffect(() => {
    if (!Array.isArray(sseTransactions)) return;

    const updates = sseTransactions.filter(isValidTransaction);
    if (!updates.length) return;

    setHighlighted((prev) => {
      const next = new Set(prev);
      updates.forEach((tx) => next.add(tx.requestId));
      return next;
    });

    setTransactions((prev) => {
      const nonProcessing = prev.filter(
        (tx) => tx.status !== "PROCESSING"
      );
      return [...nonProcessing, ...updates].sort(sortByDateDesc);
    });

    // auto-remove highlight after 6s
    setTimeout(() => {
      setHighlighted((prev) => {
        const next = new Set(prev);
        updates.forEach((tx) => next.delete(tx.requestId));
        return next;
      });
    }, 6000);
  }, [sseTransactions]);

  /* ================= FILTER ================= */

  const filtered = useMemo(() => {
    return transactions.filter((tx) => {
      const matchesSearch =
        tx.requestId.toLowerCase().includes(search.toLowerCase()) ||
        tx.serviceId.toLowerCase().includes(search.toLowerCase());

      const matchesStatus = !statusFilter || tx.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [transactions, search, statusFilter]);

  const grouped = useMemo(
    () => groupTransactionsByDate(filtered),
    [filtered]
  );

  /* ================= HELPERS ================= */

  function openModal(tx: TransactionItem) {
    setSelectedTx(tx);
    setPdfUrl(`${API_BASE}/transactions/${tx.requestId}/receipt.pdf`);
  }

  function closeModal() {
    setSelectedTx(null);
    setPdfUrl(null);
  }

  function getServiceName(serviceId: string) {
    return serviceId.replace(/_/g, " ");
  }

  function sortByDateDesc(a: TransactionItem, b: TransactionItem) {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  }

  /* ================= UI ================= */

  return (
    <div className="max-w-4xl mx-auto p-5 space-y-4">
      <h1 className="text-2xl font-bold">Transactions</h1>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          className="flex-1 p-2 border rounded"
          placeholder="Search by reference or service"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="p-2 border rounded"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All statuses</option>
          <option value="SUCCESS">Success</option>
          <option value="PROCESSING">Processing</option>
          <option value="FAILED">Failed</option>
        </select>
      </div>

      {loading ? (
        <p>Loading transactions…</p>
      ) : (
        <>
          <TransactionSection
            title="Today"
            items={grouped.today}
            highlighted={highlighted}
            onOpen={openModal}
          />
          <TransactionSection
            title="Yesterday"
            items={grouped.yesterday}
            highlighted={highlighted}
            onOpen={openModal}
          />
          <TransactionSection
            title="Older"
            items={grouped.older}
            highlighted={highlighted}
            onOpen={openModal}
          />
        </>
      )}

      {/* ================= MODAL ================= */}
{selectedTx && (
  <div
    className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center"
    onClick={closeModal}
  >
    <div
      className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 max-w-xl w-full rounded-lg p-6 space-y-4 shadow-lg"
      onClick={(e) => e.stopPropagation()}
    >
      <h2 className="text-xl font-bold">Transaction Details</h2>

      <div className="space-y-2 text-sm">
        <p>
          <b>Service:</b> {getServiceName(selectedTx.serviceId)}
        </p>
        <p>
          <b>Reference:</b> {selectedTx.requestId}
        </p>
        <p>
          <b>Amount:</b> ₦{selectedTx.amount}
        </p>
        <p>
          <b>Status:</b> {selectedTx.status}
        </p>
        <p className="text-gray-500 dark:text-gray-400">
          {formatTransactionTime(selectedTx.createdAt)}
        </p>
      </div>

      {(selectedTx.apiResponse?.token ||
        selectedTx.apiResponse?.pin) && (
        <div className="bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700 rounded p-3 text-center">
          <p className="text-xs uppercase text-green-700 dark:text-green-300 mb-1">
            Electricity Token
          </p>
          <p className="font-mono text-lg tracking-widest">
            {formatToken(
              selectedTx.apiResponse.token ||
                selectedTx.apiResponse.pin!
            )}
          </p>
        
       {selectedTx.meta?.units && (
      <div className="pt-2 border-t border-green-200 dark:border-green-700">
        <p className="text-xs text-green-700 dark:text-green-300">
          Units
        </p>
        <p className="font-semibold">
          {selectedTx.meta.units}{" "}
          {selectedTx.meta.unitLabel || "kWh"}
        </p>
      </div>
    )}
  </div>
)}

      <div className="flex gap-2 pt-2">
        <button
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded"
          onClick={() => window.open(pdfUrl!, "_blank")}
        >
          Download Receipt
        </button>

        <button
          className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded"
          onClick={() => shareViaWhatsApp(selectedTx.requestId)}
        >
          Share WhatsApp
        </button>

        <button
          className="flex-1 bg-gray-200 dark:bg-gray-700 dark:text-gray-100 py-2 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
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


/* ================= SECTION ================= */

function TransactionSection({
  title,
  items,
  highlighted,
  onOpen,
}: {
  title: string;
  items: TransactionItem[];
  highlighted: Set<string>;
  onOpen: (tx: TransactionItem) => void;
}) {
  if (!items.length) return null;

  return (
    <div className="space-y-2">
      <h3 className="text-xs font-semibold uppercase text-gray-500">
        {title}
      </h3>

      {items.map((tx) => (
        <div
          key={tx.requestId}
          onClick={() => onOpen(tx)}
          className={`p-4 border rounded-lg cursor-pointer transition
            ${
              highlighted.has(tx.requestId)
                ? "bg-green-50 border-green-400"
                : "hover:bg-gray-50"
            }
          `}
        >
          <div className="flex justify-between">
            <div>
              <p className="font-semibold capitalize">
                {tx.serviceId.replace(/_/g, " ")}
              </p>
              <p className="text-xs text-gray-500">
                {formatTransactionTime(tx.createdAt)}
              </p>
            </div>

            <span
              className={`px-2 py-1 text-xs rounded font-semibold
                ${
                  tx.status === "SUCCESS" &&
                  "bg-green-100 text-green-700"
                }
                ${
                  tx.status === "FAILED" &&
                  "bg-red-100 text-red-700"
                }
                ${
                  tx.status === "PROCESSING" &&
                  "bg-yellow-100 text-yellow-700"
                }
              `}
            >
              {tx.status}
            </span>
          </div>

          <p className="text-sm mt-1">₦{tx.amount}</p>
        </div>
      ))}
    </div>
  );
}
