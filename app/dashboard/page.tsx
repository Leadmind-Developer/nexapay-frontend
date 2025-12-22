"use client";

import React, { useState, useEffect, useCallback } from "react";
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
import BannersWrapper from "@/components/BannersWrapper";
import api from "@/lib/api";

interface VirtualAccount {
  number: string;
  bank: string;
}

export default function DashboardPage() {
  const [balance, setBalance] = useState(0);
  const [firstName, setFirstName] = useState("User");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [hideBalance, setHideBalance] = useState(false);
  const [virtualAccount, setVirtualAccount] = useState<VirtualAccount | null>(null);

  /* ------------------------- Fetch Wallet ------------------------- */
  const fetchWallet = useCallback(async () => {
    try {
      if (!refreshing) setLoading(true);

      const userRes = await api.get("/user/me");
      if (!userRes.data?.success) return;

      const u = userRes.data.user;
      const first =
        u.name?.split(" ")[0] ||
        u.email?.split("@")[0] ||
        "User";
      setFirstName(first);

      const walletRes = await api.get("/wallet");
      setBalance((walletRes.data?.balance ?? 0) / 100);

      if (u.virtualAccount) {
        setVirtualAccount({
          number: u.virtualAccount.accountNumber,
          bank: u.virtualAccount.bank,
        });
      } else {
        setVirtualAccount(null);
      }
    } catch (err) {
      console.error("Failed to fetch wallet:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [refreshing]);

  /* ------------------------- Auto refresh ------------------------- */
  useEffect(() => {
    fetchWallet();

    const onFocus = () => fetchWallet();
    window.addEventListener("focus", onFocus);

    const interval = setInterval(fetchWallet, 30_000);
    return () => {
      window.removeEventListener("focus", onFocus);
      clearInterval(interval);
    };
  }, [fetchWallet]);

  const refreshBalance = () => {
    setRefreshing(true);
    fetchWallet();
  };

  /* ------------------------- Loading ------------------------- */
  if (loading) {
    return (
      <BannersWrapper page="dashboard">
        <div className="flex justify-center items-center h-[60vh]">
          <p className="animate-pulse text-gray-400">Loading dashboard…</p>
        </div>
      </BannersWrapper>
    );
  }

  /* ------------------------- UI ------------------------- */
  return (
    <BannersWrapper page="dashboard">
      <div className="max-w-5xl mx-auto p-6 space-y-6">
        {/* Balance Card */}
        <div className="bg-blue-600 p-6 rounded-2xl text-white shadow">
          <div className="flex justify-between items-center">
            <p className="text-sm opacity-90">Welcome back, {firstName}</p>
            <button
              onClick={refreshBalance}
              disabled={refreshing}
              className="flex items-center gap-1 text-sm opacity-80"
            >
              <IoRefreshOutline
                size={18}
                className={refreshing ? "animate-spin" : ""}
              />
              Refresh
            </button>
          </div>

          <div className="flex justify-between items-center mt-3">
            <div>
              <p className="text-xs opacity-80">Wallet Balance</p>
              <p className="text-3xl font-bold">
                {hideBalance
                  ? "₦••••••"
                  : `₦${balance.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                    })}`}
              </p>
            </div>
            <button onClick={() => setHideBalance(!hideBalance)}>
              {hideBalance ? <IoEyeOffOutline size={24} /> : <IoEyeOutline size={24} />}
            </button>
          </div>

          {/* Virtual Account */}
          {virtualAccount ? (
            <div className="mt-4 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 p-4 rounded-lg flex justify-between">
              <div>
                <p className="text-xs text-gray-500">Virtual Account</p>
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
                <IoCopyOutline size={18} />
              </button>
            </div>
          ) : (
            <a
              href="/dashboard/setupnairaaccount"
              className="inline-block mt-4 bg-white text-blue-600 font-semibold px-4 py-2 rounded-lg"
            >
              Create Naira Account
            </a>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { title: "Add Money", screen: "/dashboard/addmoney", icon: <IoAddCircleOutline size={26} /> },
            { title: "Withdraw", screen: "/dashboard/withdraw", icon: <IoSwapHorizontalOutline size={26} /> },
            { title: "Send Money", screen: "/dashboard/internaltransfer", icon: <IoPaperPlaneOutline size={26} /> },
          ].map((q, i) => (
            <motion.a
              key={i}
              href={q.screen}
              whileHover={{ scale: 1.05 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-4 flex flex-col items-center shadow"
            >
              {q.icon}
              <p className="mt-2 font-semibold text-sm">{q.title}</p>
            </motion.a>
          ))}
        </div>
      </div>
    </BannersWrapper>
  );
}
