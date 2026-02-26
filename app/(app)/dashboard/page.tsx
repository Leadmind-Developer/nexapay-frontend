"use client";

import React, { useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/components/providers/AuthProvider";
import { useRouter } from "next/navigation";
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

interface VirtualAccount {
  number: string;
  bank: string;
}

export default function DashboardPage() {
  const [balance, setBalance] = useState<number>(0);
  const [firstName, setFirstName] = useState("User");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [hideBalance, setHideBalance] = useState(false);
  const [virtualAccount, setVirtualAccount] = useState<VirtualAccount | null>(null);
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
  if (!loading && !user) {
    router.replace("/login");
  }
}, [loading, user]);

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

  useEffect(() => {
    fetchWallet();
  }, [fetchWallet]);

  const refreshBalance = () => {
    setRefreshing(true);
    fetchWallet();
  };

  const quickActions = [
    { title: "Add Money", screen: "/dashboard/addmoney", icon: <IoAddCircleOutline size={26} /> },
    { title: "Send Other", screen: "/dashboard/withdraw", icon: <IoSwapHorizontalOutline size={26} /> },
    { title: "Send Nexa", screen: "/dashboard/internaltransfer", icon: <IoPaperPlaneOutline size={26} /> },
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

        {/* Transactions / Events / Expenses Shortcut */}
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
          See all your transactions, events, and expenses below
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a
            href="/transactions"
            className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow hover:shadow-lg transition flex flex-col justify-between"
          >
            <div>
              <p className="text-lg font-bold text-gray-900 dark:text-gray-100">Transactions</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                All wallet, bills & transfers
              </p>
            </div>
            <span className="mt-2 text-blue-600 dark:text-blue-400 font-semibold">Go</span>
          </a>

          <a
            href="/events"
            className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow hover:shadow-lg transition flex flex-col justify-between"
          >
            <div>
              <p className="text-lg font-bold text-gray-900 dark:text-gray-100">Events</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                View & manage your events
              </p>
            </div>
            <span className="mt-2 text-blue-600 dark:text-blue-400 font-semibold">Go</span>
          </a>

          <a
            href="/expenses"
            className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow hover:shadow-lg transition flex flex-col justify-between"
          >
            <div>
              <p className="text-lg font-bold text-gray-900 dark:text-gray-100">Expenses</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Track & manage your expenses
              </p>
            </div>
            <span className="mt-2 text-blue-600 dark:text-blue-400 font-semibold">Go</span>
          </a>
        </div>
      </div>
    </div>
  );
}
