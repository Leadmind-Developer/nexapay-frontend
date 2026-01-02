"use client";

import { useEffect, useState, useMemo } from "react";
import api from "@/lib/api";
import { useTransactionsSSE } from "@/hooks/useTransactionsSSE";
import { API_BASE } from "@/lib/constants";
import {
  formatTransactionTime,
  formatToken,
  groupTransactionsByDate,
} from "@/lib/utils/transactions";

/* ================= TYPES ================= */

export interface TransactionItem {
  requestId: string;
  serviceId: string;
  status: "SUCCESS" | "FAILED" | "PROCESSING" | string;
  amount: number;
  createdAt: string;
  type: "credit" | "debit";

  apiResponse?: {
    token?: string;
    pin?: string;
    units?: string | number;
    unitLabel?: string;
  };

  meta?: {
    token?: string;
    units?: string | number;
    unitLabel?: string;
  };
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
  const [highlighted, setHighlighted] = useState<Set<string>>(new Set());

  const sseTransactions = useTransactionsSSE();

  /* ================= FETCH ================= */

  useEffect(() => {
    (async () => {
      try {
        // Fetch VTpass transactions
        const vtpassRes = await api.get("/transactions");
        const vtpassTxs: TransactionItem[] = Array.isArray(vtpassRes.data)
          ? vtpassRes.data.filter(isValidTransaction).map((tx) => ({
              ...tx,
              type: "debit", // service purchase is always debit
            }))
          : [];

        // Fetch wallet transactions
        const walletRes = await api.get("/wallet");
        const walletTxs: TransactionItem[] = (walletRes.data?.wallet?.transactions || []).map((tx: any) => ({
          requestId: tx.id.toString(),
          serviceId: tx.type === "credit" ? "wallet_credit" : "wallet_debit",
          status: tx.status || "SUCCESS",
          amount: tx.amount,
          createdAt: tx.createdAt,
          type: tx.type,
        }));

        // Merge both
        const merged = [...walletTxs, ...vtpassTxs].sort(sortByDateDesc);
        setTransactions(merged);
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
      const nonProcessing = prev.filter((tx) => tx.status !== "PROCESSING");
      const newUpdates = updates.map((tx) => ({ ...tx, type: "debit" }));
      return [...nonProcessing, ...newUpdates].sort(sortByDateDesc);
    });

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

  const grouped = useMemo(() => groupTransactionsByDate(filtered), [filtered]);

  /* ================= HELPERS ================= */

  function openModal(tx: TransactionItem) {
    setSelectedTx(tx);
  }

  function closeModal() {
    setSelectedTx(null);
  }

  function sortByDateDesc(a: TransactionItem, b: TransactionItem) {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  }

  function getServiceLabel(tx: TransactionItem) {
    if (tx.serviceId === "wallet_credit") return "Wallet Credit";
    if (tx.serviceId === "wallet_debit") return "Wallet Debit";
    return tx.serviceId.replace(/_/g, " ");
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
          {(["today", "yesterday", "older"] as const).map((key) =>
            grouped[key] && grouped[key].length > 0 ? (
              <TransactionSection
                key={key}
                title={key.toUpperCase()}
                items={grouped[key]}
                highlighted={highlighted}
                onOpen={openModal}
                getLabel={getServiceLabel}
              />
            ) : null
          )}
        </>
      )}

      {/* ================= MODAL ================= */}
      {selectedTx && (
        <TransactionModal tx={selectedTx} onClose={closeModal} />
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
  getLabel,
}: {
  title: string;
  items: TransactionItem[];
  highlighted: Set<string>;
  onOpen: (tx: TransactionItem) => void;
  getLabel: (tx: TransactionItem) => string;
}) {
  return (
    <div className="space-y-2">
      <h3 className="text-xs font-semibold uppercase text-gray-500">{title}</h3>

      {items.map((tx) => (
        <button
          key={tx.requestId}
          onClick={() => onOpen(tx)}
          className={`w-full flex justify-between items-center p-3 rounded-lg mb-2 transition
            ${tx.type === "credit" ? "bg-green-50 dark:bg-green-900" : "bg-red-50 dark:bg-red-900"}
            ${highlighted.has(tx.requestId) ? "ring-2 ring-green-400" : ""}
          `}
        >
          <div className="text-left">
            <p className="font-semibold text-gray-900 dark:text-gray-100">{getLabel(tx)}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{formatTransactionTime(tx.createdAt)}</p>
            <p className="text-xs capitalize opacity-70">{tx.status}</p>
          </div>

          <p className="font-semibold text-gray-900 dark:text-gray-100">
            {tx.type === "credit" ? "+" : "-"}₦{tx.amount.toLocaleString()}
          </p>
        </button>
      ))}
    </div>
  );
}

/* ================= MODAL COMPONENT ================= */

function TransactionModal({
  tx,
  onClose,
}: {
  tx: TransactionItem;
  onClose: () => void;
}) {
  const pdfUrl = `${API_BASE}/transactions/${tx.requestId}/receipt.pdf`;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-900 w-[90%] max-w-md p-6 rounded-xl space-y-4">
        <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100">Transaction Receipt</h3>

        <div className="text-sm space-y-1 text-gray-700 dark:text-gray-300">
          <p><b>Status:</b> {tx.status}</p>
          <p><b>Service:</b> {tx.serviceId}</p>
          <p><b>Amount:</b> ₦{tx.amount}</p>
          <p><b>Date:</b> {formatTransactionTime(tx.createdAt)}</p>
          <p className="break-all"><b>Reference:</b> {tx.requestId}</p>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-4">
          <button
            onClick={() => window.open(pdfUrl, "_blank")}
            className="bg-blue-600 text-white py-2 rounded-lg"
          >
            Download
          </button>

          <button
            onClick={() =>
              window.open(`https://wa.me/?text=${encodeURIComponent(
                `Nexa Transaction Receipt\nReference: ${tx.requestId}\nDownload Receipt: ${pdfUrl}`
              )}`, "_blank")
            }
            className="bg-green-600 text-white py-2 rounded-lg"
          >
            WhatsApp
          </button>

          <button
            onClick={onClose}
            className="col-span-2 bg-gray-200 dark:bg-gray-700 py-2 rounded-lg"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
