"use client";

import React, { useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useAuth } from "@/components/providers/AuthProvider";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

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

interface VirtualAccount {
  number: string;
  bank: string;
}

export default function DashboardPage() {
  /* ------------------------------------------------------------------ */
  /* AUTH STATE                                                          */
  /* ------------------------------------------------------------------ */

  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  /* ------------------------------------------------------------------ */
  /* DASHBOARD STATE                                                     */
  /* ------------------------------------------------------------------ */

  const [balance, setBalance] = useState(0);
  const [walletLoading, setWalletLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [hideBalance, setHideBalance] = useState(false);
  const [virtualAccount, setVirtualAccount] =
    useState<VirtualAccount | null>(null);

  const firstName =
    user?.name?.split(" ")[0] ||
    user?.email?.split("@")[0] ||
    "User";

  /* ------------------------------------------------------------------ */
  /* REDIRECT IF NOT AUTHENTICATED                                      */
  /* ------------------------------------------------------------------ */

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login");
    }
  }, [authLoading, user, router]);

  /* ------------------------------------------------------------------ */
  /* FETCH WALLET ONLY WHEN USER EXISTS                                  */
  /* ------------------------------------------------------------------ */

  const fetchWallet = useCallback(async () => {
    if (!user) return;

    try {
      if (!refreshing) setWalletLoading(true);

      const walletRes = await api.get("/wallet");
      const walletData = walletRes.data?.wallet;

      if (walletData) {
        setBalance(walletData.balance);
      }

      const va = walletRes.data?.virtualAccount;

      setVirtualAccount(
        va
          ? {
              number: va.accountNumber,
              bank: va.bankName,
            }
          : null
      );
    } catch (err) {
      console.error("Wallet fetch failed:", err);
    } finally {
      setWalletLoading(false);
      setRefreshing(false);
    }
  }, [user, refreshing]);

  useEffect(() => {
    if (user) fetchWallet();
  }, [user, fetchWallet]);

  const refreshBalance = () => {
    setRefreshing(true);
    fetchWallet();
  };

  /* ------------------------------------------------------------------ */
  /* LOADING STATES                                                      */
  /* ------------------------------------------------------------------ */

  if (authLoading || walletLoading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <p className="animate-pulse text-gray-400">
          Loading dashboard…
        </p>
      </div>
    );
  }

  /* ------------------------------------------------------------------ */
  /* UI                                                                  */
  /* ------------------------------------------------------------------ */

  const quickActions = [
    { title: "Add Money", screen: "/dashboard/addmoney", icon: <IoAddCircleOutline size={26}/> },
    { title: "Send Other", screen: "/dashboard/withdraw", icon: <IoSwapHorizontalOutline size={26}/> },
    { title: "Send Nexa", screen: "/dashboard/internaltransfer", icon: <IoPaperPlaneOutline size={26}/> },
  ];

  const services = [
    { title: "Airtime", screen: "/airtime", color: "#4B7BE5", icon: <IoCallOutline size={22}/> },
    { title: "Buy Data", screen: "/data", color: "#00A86B", icon: <IoWifiOutline size={22}/> },
    { title: "Electricity", screen: "/electricity", color: "#FFB300", icon: <IoFlashOutline size={22}/> },
    { title: "Pay TV", screen: "/cable", color: "#8A39E1", icon: <IoTvOutline size={22}/> },
    { title: "Education", screen: "/education", color: "#1E90FF", icon: <IoBookOutline size={22}/> },
    { title: "More", screen: "/dashboard/more", color: "#4B7BE5", icon: <IoGridOutline size={22}/> },
  ];

  return (
    <div className="flex-1 overflow-auto p-6 max-h-screen">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* Greeting */}
        <div className="bg-blue-600 p-6 rounded-2xl shadow-md text-white">
          <div className="flex justify-between items-center">
            <p className="text-sm opacity-90">
              Welcome back, {firstName}
            </p>

            <button
              onClick={refreshBalance}
              disabled={refreshing}
              className="flex items-center gap-1 text-sm opacity-80 hover:opacity-100"
            >
              <IoRefreshOutline
                size={20}
                className={refreshing ? "animate-spin" : ""}
              />
              Refresh
            </button>
          </div>

          <div className="flex justify-between items-center mt-2">
            <div>
              <p className="text-xs opacity-80">Wallet Balance</p>
              <p className="text-3xl font-bold">
                {hideBalance
                  ? "₦••••••"
                  : `₦${balance.toLocaleString(undefined,{
                      minimumFractionDigits:2,
                      maximumFractionDigits:2,
                    })}`}
              </p>
            </div>

            <button onClick={() => setHideBalance(!hideBalance)}>
              {hideBalance ? <IoEyeOffOutline size={26}/> : <IoEyeOutline size={26}/>}
            </button>
          </div>

          {virtualAccount ? (
            <div className="mt-4 bg-white text-gray-900 p-4 rounded-lg flex justify-between items-center">
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
                <IoCopyOutline size={20}/>
              </button>
            </div>
          ) : (
            <Link
              href="/dashboard/setupnairaaccount"
              className="mt-4 inline-block bg-white text-blue-600 font-semibold py-2 px-4 rounded-lg"
            >
              Create Naira Account
            </Link>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-3 gap-4">
          {quickActions.map((q) => (
            <motion.div key={q.title} whileHover={{ scale: 1.05 }}>
              <Link
                href={q.screen}
                className="bg-white dark:bg-gray-800 rounded-xl p-4 flex flex-col items-center shadow"
              >
                {q.icon}
                <p className="text-sm font-semibold mt-2">{q.title}</p>
              </Link>
            </motion.div>
          ))}
        </div>

      </div>
    </div>
  );
}
