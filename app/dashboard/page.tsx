"use client";

import React, { useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import {
  IoAddCircleOutline,
  IoSwapHorizontalOutline,
  IoPaperPlaneOutline,
  IoCallOutline,
  IoWifiOutline,
  IoFlashOutline,
  IoTvOutline,
  IoBookOutline,
  IoGridOutline,
  IoEyeOutline,
  IoEyeOffOutline,
  IoCopyOutline,
  IoRefreshOutline,
} from "react-icons/io5";
import api from "@/lib/api";

/* ================= TYPES ================= */

interface VirtualAccount {
  number: string;
  bank: string;
}

type TxStatus = "successful" | "pending" | "failed";

interface Transaction {
  id: number;
  type: "credit" | "debit";
  amount: number;
  reference?: string | null;
  createdAt: string;

  category?: string;
  narration?: string;
  status?: string;
  transactionStatus?: string;
}

/* ================= HELPERS ================= */

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-NG", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getCategoryLabel(tx: Transaction) {
  if (tx.category) return tx.category.toUpperCase();
  if (tx.reference?.toLowerCase().includes("airtime")) return "AIRTIME";
  if (tx.reference?.toLowerCase().includes("data")) return "DATA";
  if (tx.reference?.toLowerCase().includes("electric")) return "ELECTRICITY";
  if (tx.type === "credit") return "WALLET FUNDING";
  return "PAYMENT";
}

function normalizeStatus(tx: Transaction): TxStatus {
  const raw =
    tx.status ||
    tx.transactionStatus ||
    "";

  const s = raw.toLowerCase();

  if (["success", "successful", "completed"].includes(s)) return "successful";
  if (["failed", "error", "reversed"].includes(s)) return "failed";
  return "pending";
}

function statusBadge(status: TxStatus) {
  const map = {
    successful: "bg-green-100 text-green-700",
    pending: "bg-yellow-100 text-yellow-700",
    failed: "bg-red-100 text-red-700",
  };

  return (
    <span className={`px-2 py-0.5 rounded-full text-xs ${map[status]}`}>
      {status.toUpperCase()}
    </span>
  );
}

/* ================= GROUPING ================= */

function isToday(date: string) {
  return new Date(date).toDateString() === new Date().toDateString();
}

function isThisWeek(date: string) {
  const d = new Date(date);
  const now = new Date();
  const start = new Date(now);
  start.setDate(now.getDate() - now.getDay());
  return d >= start;
}

function groupTransactions(list: Transaction[]) {
  return {
    today: list.filter(tx => isToday(tx.createdAt)),
    thisWeek: list.filter(tx => !isToday(tx.createdAt) && isThisWeek(tx.createdAt)),
    older: list.filter(tx => !isToday(tx.createdAt) && !isThisWeek(tx.createdAt)),
  };
}

/* ================= SHARE ================= */

function receiptText(tx: Transaction) {
  return `
Transaction Receipt
-------------------
Category: ${getCategoryLabel(tx)}
Type: ${tx.type}
Status: ${normalizeStatus(tx)}
Amount: ₦${tx.amount}
Date: ${formatDate(tx.createdAt)}
Reference: ${tx.reference || "N/A"}
`;
}

function shareWhatsApp(tx: Transaction) {
  window.open(`https://wa.me/?text=${encodeURIComponent(receiptText(tx))}`, "_blank");
}

function shareEmail(tx: Transaction) {
  window.location.href = `mailto:?subject=Transaction Receipt&body=${encodeURIComponent(receiptText(tx))}`;
}

function downloadReceipt(tx: Transaction) {
  const win = window.open("", "_blank");
  if (!win) return;
  win.document.write(`<pre>${receiptText(tx)}</pre>`);
  win.print();
}

/* ================= PAGE ================= */

export default function DashboardPage() {
  const [balance, setBalance] = useState(0);
  const [firstName, setFirstName] = useState("User");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [hideBalance, setHideBalance] = useState(false);
  const [virtualAccount, setVirtualAccount] = useState<VirtualAccount | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

  const fetchWallet = useCallback(async () => {
    try {
      setLoading(true);

      const userRes = await api.get("/user/me");
      const u = userRes.data?.user;
      setFirstName(u?.name?.split(" ")[0] || "User");

      const walletRes = await api.get("/wallet");
      const w = walletRes.data?.wallet;

      if (w) {
        setBalance(w.balance);
        setTransactions(w.transactions || []);
      }

      const va = walletRes.data?.virtualAccount;
      setVirtualAccount(
        va ? { number: va.accountNumber, bank: va.bankName } : null
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchWallet();
  }, [fetchWallet]);

  const openReceipt = (tx: Transaction) => {
    setSelectedTx(tx);
    window.history.pushState({}, "", `/dashboard/receipt/${tx.id}`);
  };

  const closeReceipt = () => {
    setSelectedTx(null);
    window.history.back();
  };

  const grouped = groupTransactions(transactions);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh] text-gray-400">
        Loading dashboard…
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* BALANCE */}
      <div className="bg-blue-600 p-6 rounded-2xl text-white">
        <div className="flex justify-between">
          <p>Welcome back, {firstName}</p>
          <button onClick={() => fetchWallet()}>
            <IoRefreshOutline size={20} />
          </button>
        </div>

        <div className="flex justify-between mt-3">
          <p className="text-3xl font-bold">
            {hideBalance ? "₦••••" : `₦${balance.toLocaleString()}`}
          </p>
          <button onClick={() => setHideBalance(!hideBalance)}>
            {hideBalance ? <IoEyeOffOutline size={24} /> : <IoEyeOutline size={24} />}
          </button>
        </div>

        {virtualAccount && (
          <div className="bg-white text-gray-900 mt-4 p-3 rounded-lg flex justify-between">
            <p>{virtualAccount.bank} • {virtualAccount.number}</p>
            <IoCopyOutline
              onClick={() => navigator.clipboard.writeText(virtualAccount.number)}
            />
          </div>
        )}
      </div>

      {/* TRANSACTIONS */}
      <div>
        <h2 className="font-bold mb-3">Recent Transactions</h2>

        {[["TODAY", grouped.today], ["THIS WEEK", grouped.thisWeek], ["OLDER", grouped.older]].map(
          ([label, list]: any) =>
            list.length > 0 && (
              <div key={label} className="mb-4">
                <p className="text-xs text-gray-500 mb-2">{label}</p>
                {list.map((tx: Transaction) => {
                  const status = normalizeStatus(tx);
                  return (
                    <button
                      key={tx.id}
                      onClick={() => openReceipt(tx)}
                      className="w-full flex justify-between items-center p-3 rounded-lg mb-2 bg-gray-50 hover:bg-gray-100"
                    >
                      <div>
                        <p className="font-semibold">{getCategoryLabel(tx)}</p>
                        <p className="text-xs">{formatDate(tx.createdAt)}</p>
                        {statusBadge(status)}
                      </div>
                      <p className="font-bold">
                        {tx.type === "credit" ? "+" : "-"}₦{tx.amount.toLocaleString()}
                      </p>
                    </button>
                  );
                })}
              </div>
            )
        )}
      </div>

      {/* RECEIPT MODAL */}
      {selectedTx && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white w-[90%] max-w-md p-6 rounded-xl space-y-4">
            <h3 className="font-bold text-lg">Transaction Receipt</h3>

            <div className="text-sm space-y-1">
              <p><b>Status:</b> {normalizeStatus(selectedTx)}</p>
              <p><b>Category:</b> {getCategoryLabel(selectedTx)}</p>
              <p><b>Amount:</b> ₦{selectedTx.amount}</p>
              <p><b>Date:</b> {formatDate(selectedTx.createdAt)}</p>
              <p className="break-all"><b>Ref:</b> {selectedTx.reference}</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => downloadReceipt(selectedTx)} className="bg-blue-600 text-white py-2 rounded">
                Download
              </button>
              <button onClick={() => shareWhatsApp(selectedTx)} className="bg-green-600 text-white py-2 rounded">
                WhatsApp
              </button>
              <button onClick={() => shareEmail(selectedTx)} className="col-span-2 bg-gray-700 text-white py-2 rounded">
                Share via Email
              </button>
              <button onClick={closeReceipt} className="col-span-2 bg-gray-200 py-2 rounded">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
