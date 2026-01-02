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

export interface WalletTransaction {
  id: string;
  type: "credit" | "debit";
  amount: number;
  createdAt: string;
  reference?: string;
  narration?: string;
}

export interface VTpassTransaction {
  requestId: string;
  serviceId: string;
  status: "SUCCESS" | "FAILED" | "PROCESSING" | string;
  amount: number;
  createdAt: string;
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

export interface TransactionItem {
  type: "credit" | "debit" | "service";
  requestId: string;
  serviceId?: string;
  status?: string;
  amount: number;
  createdAt: string;
  reference?: string;
  apiResponse?: VTpassTransaction["apiResponse"];
  meta?: VTpassTransaction["meta"];
}

/* ================= VALIDATORS ================= */

function isValidVTpass(tx: any): tx is VTpassTransaction {
  return (
    tx &&
    typeof tx.requestId === "string" &&
    typeof tx.serviceId === "string" &&
    typeof tx.status === "string" &&
    typeof tx.amount === "number" &&
    typeof tx.createdAt === "string"
  );
}

function isValidWallet(tx: any): tx is WalletTransaction {
  return (
    tx &&
    typeof tx.id === "string" &&
    (tx.type === "credit" || tx.type === "debit") &&
    typeof tx.amount === "number" &&
    typeof tx.createdAt === "string"
  );
}

type SectionKey = "today" | "yesterday" | "older";
const sections: SectionKey[] = ["today", "yesterday", "older"];

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
        const [walletRes, vtpassRes] = await Promise.all([
          api.get("/wallet"),
          api.get("/transactions"),
        ]);

        const walletTx: TransactionItem[] =
  (walletRes.data?.wallet?.transactions || [])
    .filter(isValidWallet)
    .map((tx: WalletTransaction) => ({
      type: tx.type,
      requestId: tx.id,
      amount: tx.amount,
      createdAt: tx.createdAt,
      reference: tx.reference,
    }));

const vtpassTx: TransactionItem[] =
  (vtpassRes.data || [])
    .filter(isValidVTpass)
    .map((tx: VTpassTransaction) => ({
      type: "service",
      requestId: tx.requestId,
      serviceId: tx.serviceId,
      status: tx.status,
      amount: tx.amount,
      createdAt: tx.createdAt,
      apiResponse: tx.apiResponse,
      meta: tx.meta,
    }));


        setTransactions([...walletTx, ...vtpassTx].sort(sortByDateDesc));
      } catch (err) {
        console.error("Failed to fetch transactions:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /* ================= SSE REALTIME ================= */
  useEffect(() => {
    if (!Array.isArray(sseTransactions)) return;

    const updates: VTpassTransaction[] = sseTransactions.filter(isValidVTpass);
    if (!updates.length) return;

    setHighlighted((prev) => {
      const next = new Set(prev);
      updates.forEach((tx) => next.add(tx.requestId));
      return next;
    });

    setTransactions((prev) => {
      const nonProcessing = prev.filter((tx) => tx.status !== "PROCESSING");
      const newUpdates: TransactionItem[] = updates.map((tx) => ({
        type: "service",
        requestId: tx.requestId,
        serviceId: tx.serviceId,
        status: tx.status,
        amount: tx.amount,
        createdAt: tx.createdAt,
        apiResponse: tx.apiResponse,
        meta: tx.meta,
      }));

      return [...nonProcessing, ...newUpdates].sort(sortByDateDesc);
    });

    // remove highlight after 6s
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
        (tx.serviceId?.toLowerCase().includes(search.toLowerCase()) ?? false);

      const matchesStatus =
        !statusFilter || (tx.status?.toLowerCase() === statusFilter.toLowerCase());

      return matchesSearch && matchesStatus;
    });
  }, [transactions, search, statusFilter]);

  const grouped = useMemo(() => groupTransactionsByDate(filtered), [filtered]);

  /* ================= HELPERS ================= */
  function openModal(tx: TransactionItem) {
    setSelectedTx(tx);
    setPdfUrl(`${API_BASE}/transactions/${tx.requestId}/receipt.pdf`);
  }

  function closeModal() {
    setSelectedTx(null);
    setPdfUrl(null);
  }

  function getServiceName(serviceId?: string) {
    return serviceId?.replace(/_/g, " ") ?? "Wallet Transaction";
  }

  function sortByDateDesc(a: TransactionItem, b: TransactionItem) {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  }

  function getTxColor(tx: TransactionItem) {
    if (tx.type === "credit") return "text-green-700";
    if (tx.type === "debit") return "text-red-700";
    if (tx.type === "service") {
      if (tx.status === "SUCCESS") return "text-green-700";
      if (tx.status === "FAILED") return "text-red-700";
      if (tx.status === "PROCESSING") return "text-yellow-600";
      return "text-gray-900";
    }
    return "text-gray-900";
  }

  /* ================= UI ================= */
  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <p className="text-gray-400 dark:text-gray-300 animate-pulse">
          Loading transactions…
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-5 space-y-4">
      <h1 className="text-2xl font-bold">Transactions</h1>

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

      {sections.map((section) => (
        <TransactionSection
          key={section}
          title={section.toUpperCase()}
          items={grouped[section]}
          highlighted={highlighted}
          onOpen={openModal}
          getTxColor={getTxColor}
        />
      ))}

      {selectedTx && (
        <TransactionModal tx={selectedTx} pdfUrl={pdfUrl} onClose={closeModal} />
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
  getTxColor,
}: {
  title: string;
  items: TransactionItem[];
  highlighted: Set<string>;
  onOpen: (tx: TransactionItem) => void;
  getTxColor: (tx: TransactionItem) => string;
}) {
  if (!items.length) return null;

  function getServiceName(serviceId?: string) {
    return serviceId?.replace(/_/g, " ") ?? "Wallet Transaction";
  }

  return (
    <div className="space-y-2">
      <h3 className="text-xs font-semibold uppercase text-gray-500">{title}</h3>

      {items.map((tx) => (
        <div
          key={tx.requestId}
          onClick={() => onOpen(tx)}
          className={`p-4 border rounded-lg cursor-pointer transition
            ${highlighted.has(tx.requestId)
              ? "bg-green-50 border-green-400"
              : "hover:bg-gray-50 dark:hover:bg-gray-700"}`}
        >
          <div className="flex justify-between">
            <div>
              <p className="font-semibold capitalize">{getServiceName(tx.serviceId)}</p>
              <p className="text-xs text-gray-500">{formatTransactionTime(tx.createdAt)}</p>
              {tx.status && (
                <p className={`text-xs uppercase ${tx.type === "service" ? getTxColor(tx) : ""}`}>
                  <b>Status:</b> {tx.status}
                </p>
              )}
            </div>

            <p className={`font-semibold ${getTxColor(tx)}`}>
              {tx.type === "debit" ? "-" : tx.type === "credit" ? "+" : ""}₦
              {tx.amount.toLocaleString()}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ================= MODAL ================= */
function TransactionModal({
  tx,
  pdfUrl,
  onClose,
}: {
  tx: TransactionItem;
  pdfUrl: string | null;
  onClose: () => void;
}) {
  function getServiceName(serviceId?: string) {
    return serviceId?.replace(/_/g, " ") ?? "Wallet Transaction";
  }

  function getTxColor(tx: TransactionItem) {
    if (tx.type === "credit") return "text-green-700";
    if (tx.type === "debit") return "text-red-700";
    if (tx.type === "service") {
      if (tx.status === "SUCCESS") return "text-green-700";
      if (tx.status === "FAILED") return "text-red-700";
      if (tx.status === "PROCESSING") return "text-yellow-600";
      return "text-gray-900";
    }
    return "text-gray-900";
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 max-w-xl w-full rounded-lg p-6 space-y-4 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold">Transaction Details</h2>

        <div className="space-y-2 text-sm">
          <p>
            <b>Type:</b>{" "}
            {tx.type === "service"
              ? "Service Purchase"
              : tx.type === "credit"
              ? "Credit"
              : "Debit"}
          </p>
          <p>
            <b>Service/Category:</b> {getServiceName(tx.serviceId)}
          </p>
          {tx.reference && (
            <p>
              <b>Reference:</b> {tx.reference}
            </p>
          )}
          <p>
            <b>Amount:</b>{" "}
            {tx.type === "debit" ? "-" : tx.type === "credit" ? "+" : ""}₦
            {tx.amount.toLocaleString()}
          </p>
          {tx.status && (
            <p className={`${tx.type === "service" ? getTxColor(tx) : ""}`}>
              <b>Status:</b> {tx.status}
            </p>
          )}
          <p className="text-gray-500 dark:text-gray-400">{formatTransactionTime(tx.createdAt)}</p>
        </div>

        {(tx.apiResponse?.token || tx.apiResponse?.pin) && (
          <div className="bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700 rounded p-3 text-center">
            <p className="text-xs uppercase text-green-700 dark:text-green-300 mb-1">
              Electricity Token
            </p>
            <p className="font-mono text-lg tracking-widest">
              {formatToken(tx.apiResponse.token || tx.apiResponse.pin!)}
            </p>

            {tx.meta?.units && (
              <div className="pt-2 border-t border-green-200 dark:border-green-700">
                <p className="text-xs text-green-700 dark:text-green-300">Units</p>
                <p className="font-semibold">
                  {tx.meta.units} {tx.meta.unitLabel || "kWh"}
                </p>
              </div>
            )}
          </div>
        )}

        <div className="flex gap-2 pt-2">
          {pdfUrl && (
            <button
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded"
              onClick={() => window.open(pdfUrl, "_blank")}
            >
              Download Receipt
            </button>
          )}

          {pdfUrl && (
            <button
              className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded"
              onClick={() => shareViaWhatsApp(tx.requestId, pdfUrl)}
            >
              Share WhatsApp
            </button>
          )}

          <button
            className="flex-1 bg-gray-200 dark:bg-gray-700 dark:text-gray-100 py-2 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
