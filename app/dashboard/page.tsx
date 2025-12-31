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
import {
  formatDate,
  getCategoryLabel,
  normalizeStatus,
  groupTransactions,
  shareWhatsApp,
  shareEmail,
  downloadReceipt,
} from "@/lib/transactionHelpers";

interface VirtualAccount {
  number: string;
  bank: string;
}

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

export default function DashboardPage() {
  const [balance, setBalance] = useState<number>(0);
  const [firstName, setFirstName] = useState("User");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [hideBalance, setHideBalance] = useState(false);
  const [virtualAccount, setVirtualAccount] = useState<VirtualAccount | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

  const fetchWallet = useCallback(async () => {
    try {
      if (!refreshing) setLoading(true);

      // Fetch user info
      const userRes = await api.get("/user/me");
      if (!userRes.data?.success) return;

      const u = userRes.data.user;
      setFirstName(u.name?.split(" ")[0] || u.email?.split("@")[0] || "User");

      // Fetch wallet info
      const walletRes = await api.get("/wallet");
      const walletData = walletRes.data?.wallet;

      if (walletData) {
        setBalance(walletData.balance); // already in Naira
        setTransactions(walletData.transactions || []);
      }

      // Virtual account
      const va = walletRes.data?.virtualAccount;
      if (va) {
        setVirtualAccount({
          number: va.accountNumber,
          bank: va.bankName,
        });
      } else setVirtualAccount(null);
    } catch (err) {
      console.error("Failed to fetch wallet data:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [refreshing]);

  // Initial fetch
  useEffect(() => {
    fetchWallet();
  }, [fetchWallet]);

  const refreshBalance = () => {
    setRefreshing(true);
    fetchWallet();
  };

  const quickActions = [
    { title: "Add Money", screen: "/dashboard/addmoney", icon: <IoAddCircleOutline size={26} /> },
    { title: "Withdraw", screen: "/dashboard/withdraw", icon: <IoSwapHorizontalOutline size={26} /> },
    { title: "Send Money", screen: "/dashboard/internaltransfer", icon: <IoPaperPlaneOutline size={26} /> },
  ];

  const services = [
    { title: "Airtime", screen: "/airtime", color: "#4B7BE5", icon: <IoCallOutline size={22} /> },
    { title: "Buy Data", screen: "/data", color: "#00A86B", icon: <IoWifiOutline size={22} /> },
    { title: "Electricity", screen: "/electricity", color: "#FFB300", icon: <IoFlashOutline size={22} /> },
    { title: "Pay TV", screen: "/cable", color: "#8A39E1", icon: <IoTvOutline size={22} /> },
    { title: "Education", screen: "/education", color: "#1E90FF", icon: <IoBookOutline size={22} /> },
    { title: "More", screen: "/dashboard/more", color: "#4B7BE5", icon: <IoGridOutline size={22} /> },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <p className="text-gray-400 dark:text-gray-300 animate-pulse">Loading dashboard…</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto p-6 max-h-screen">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Greeting & Balance */}
        <div className="bg-blue-600 p-6 rounded-2xl shadow-md text-white">
          <div className="flex justify-between items-center">
            <p className="text-sm opacity-90">Welcome back, {firstName}</p>
            <button
              onClick={refreshBalance}
              disabled={refreshing}
              className="flex items-center gap-1 text-sm opacity-80 hover:opacity-100"
            >
              <IoRefreshOutline size={20} className={refreshing ? "animate-spin" : ""} />
              <span>Refresh</span>
            </button>
          </div>

          <div className="flex justify-between items-center mt-2">
            <div>
              <p className="text-xs opacity-80">Wallet Balance</p>
              <p className="text-3xl font-bold">
                {hideBalance
                  ? "₦••••••"
                  : `₦${balance.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}`}
              </p>
            </div>
            <button onClick={() => setHideBalance(!hideBalance)}>
              {hideBalance ? <IoEyeOffOutline size={26} /> : <IoEyeOutline size={26} />}
            </button>
          </div>

          {virtualAccount ? (
            <div className="mt-4 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 p-4 rounded-lg flex justify-between items-center">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-300">Virtual Account</p>
                <p className="font-semibold">
                  {virtualAccount.bank} • {virtualAccount.number}
                </p>
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(virtualAccount.number);
                  alert("Account number copied");
                }}
              >
                <IoCopyOutline size={20} />
              </button>
            </div>
          ) : (
            <a
              href="/dashboard/setupnairaaccount"
              className="mt-4 inline-block bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 font-semibold py-2 px-4 rounded-lg"
            >
              Create Naira Account
            </a>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-3 gap-4">
          {quickActions.map((q, i) => (
            <motion.a
              key={i}
              href={q.screen}
              whileHover={{ scale: 1.05, boxShadow: "0 10px 25px rgba(0,0,0,0.15)" }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-4 flex flex-col items-center shadow"
            >
              {q.icon}
              <p className="text-sm font-semibold mt-2 text-gray-900 dark:text-gray-100">{q.title}</p>
            </motion.a>
          ))}
        </div>

        {/* Services */}
        <div>
          <h2 className="text-lg font-bold mb-3 text-gray-900 dark:text-gray-100">Services</h2>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
            {services.map((s, i) => (
              <motion.a
                key={i}
                href={s.screen}
                whileHover={{ scale: 1.05, boxShadow: "0 10px 25px rgba(0,0,0,0.15)" }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="flex flex-col items-center p-4 bg-white dark:bg-gray-800 rounded-xl shadow"
              >
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center mb-2"
                  style={{ backgroundColor: s.color }}
                >
                  {s.icon}
                </div>
                <p className="text-xs font-semibold text-center text-gray-900 dark:text-gray-100">{s.title}</p>
              </motion.a>
            ))}
          </div>
        </div>

        {/* Transaction History */}
<div>
  <h2 className="text-lg font-bold mb-3 text-gray-900 dark:text-gray-100">
    Recent Transactions
  </h2>

  {transactions.length === 0 ? (
    <p className="text-gray-500 dark:text-gray-400">No transactions yet</p>
  ) : (
    (() => {
      const grouped = groupTransactions(transactions);

      return (
        <div className="space-y-4">
          {(["today", "thisWeek", "older"] as const).map((key) =>
            grouped[key].length > 0 ? (
              <div key={key}>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">
                  {key === "today"
                    ? "TODAY"
                    : key === "thisWeek"
                    ? "THIS WEEK"
                    : "OLDER"}
                </p>

                {grouped[key].map((tx) => {
                  const status = normalizeStatus(tx);

                  return (
                    <button
                      key={tx.id}
                      onClick={() => setSelectedTx(tx)}
                      className={`w-full flex justify-between items-center p-3 rounded-lg mb-2 transition
                        ${
                          tx.type === "credit"
                            ? "bg-green-50 dark:bg-green-900"
                            : "bg-red-50 dark:bg-red-900"
                        }
                      `}
                    >
                      <div className="text-left">
                        <p className="font-semibold text-gray-900 dark:text-gray-100">
                          {getCategoryLabel(tx)}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {formatDate(tx.createdAt)}
                        </p>
                        <p className="text-xs capitalize opacity-70">
                          {status}
                        </p>
                      </div>

                      <p className="font-semibold text-gray-900 dark:text-gray-100">
                        {tx.type === "credit" ? "+" : "-"}₦
                        {tx.amount.toLocaleString()}
                      </p>
                    </button>
                  );
                })}
              </div>
            ) : null
          )}
        </div>
      );
    })()
  )}
</div>

        {selectedTx && (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
    <div className="bg-white dark:bg-gray-900 w-[90%] max-w-md p-6 rounded-xl space-y-4">
      <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100">
        Transaction Receipt
      </h3>

      <div className="text-sm space-y-1 text-gray-700 dark:text-gray-300">
        <p><b>Status:</b> {normalizeStatus(selectedTx)}</p>
        <p><b>Category:</b> {getCategoryLabel(selectedTx)}</p>
        <p><b>Amount:</b> ₦{selectedTx.amount}</p>
        <p><b>Date:</b> {formatDate(selectedTx.createdAt)}</p>
        <p className="break-all">
          <b>Reference:</b> {selectedTx.reference || "N/A"}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 pt-4">
        <button
          onClick={() => downloadReceipt(selectedTx)}
          className="bg-blue-600 text-white py-2 rounded-lg"
        >
          Download
        </button>

        <button
          onClick={() => shareWhatsApp(selectedTx)}
          className="bg-green-600 text-white py-2 rounded-lg"
        >
          WhatsApp
        </button>

        <button
          onClick={() => shareEmail(selectedTx)}
          className="col-span-2 bg-gray-700 text-white py-2 rounded-lg"
        >
          Share via Email
        </button>

        <button
          onClick={() => setSelectedTx(null)}
          className="col-span-2 bg-gray-200 dark:bg-gray-700 py-2 rounded-lg"
        >
          Close
        </button>
      </div>
    </div>
  </div>
)}
 </div>
    </div>
  );
}
