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
} from "react-icons/io5";
import ResponsiveLandingWrapper from "@/components/ResponsiveLandingWrapper";
import BannersWrapper from "@/components/BannersWrapper";
import api from "@/lib/api";

/* ---------------------------------- Types --------------------------------- */
interface VirtualAccount {
  number: string;
  bank: string;
  name: string;
}

export default function DashboardPage() {
  const [balance, setBalance] = useState<number>(0);
  const [firstName, setFirstName] = useState("User");
  const [loading, setLoading] = useState(true);
  const [hideBalance, setHideBalance] = useState(false);
  const [virtualAccount, setVirtualAccount] = useState<VirtualAccount | null>(null);

  /* ----------------------------- Fetch user data ---------------------------- */
  const fetchUserData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get("/user/me");
      if (!res.data?.success) return;

      const u = res.data.user;

      const first =
        u.firstName ||
        u.name?.split(" ")?.[0] ||
        u.email?.split("@")?.[0] ||
        "User";
      setFirstName(first);

      if (typeof u.balance === "number") {
        setBalance(u.balance / 100);
      }

      if (u.titanAccountNumber && u.titanBankName) {
        setVirtualAccount({
          number: u.titanAccountNumber,
          bank: u.titanBankName,
          name: `${u.firstName || ""} ${u.lastName || ""}`.trim(),
        });
      } else {
        setVirtualAccount(null);
      }
    } catch (err) {
      console.error("Failed to fetch dashboard data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  /* ------------------------- Auto-refresh on focus ------------------------- */
  useEffect(() => {
    fetchUserData();

    const handleFocus = () => {
      fetchUserData();
    };

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [fetchUserData]);

  /* ----------------------------- UI Config ----------------------------- */
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

  /* ------------------------------ Loading ------------------------------ */
  if (loading) {
    return (
      <ResponsiveLandingWrapper>
        <BannersWrapper page="dashboard">
          <div className="flex justify-center items-center h-[60vh]">
            <p className="text-gray-400 dark:text-gray-300 animate-pulse">
              Loading dashboard…
            </p>
          </div>
        </BannersWrapper>
      </ResponsiveLandingWrapper>
    );
  }

  /* ------------------------------ Render ------------------------------ */
  return (
    <ResponsiveLandingWrapper>
      <BannersWrapper page="dashboard">
        <div className="max-w-5xl mx-auto p-6 space-y-6">
          {/* ---------------- Greeting & Balance ---------------- */}
          <div className="bg-blue-600 p-6 rounded-2xl shadow-md text-white">
            <p className="text-sm opacity-90">Welcome back, {firstName}</p>

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

            {/* ---------------- Virtual Account ---------------- */}
            {virtualAccount ? (
              <div className="mt-4 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 p-4 rounded-lg flex justify-between items-center">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-300">Virtual Account</p>
                  <p className="font-semibold">{virtualAccount.bank} • {virtualAccount.number}</p>
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

          {/* ---------------- Quick Actions ---------------- */}
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

          {/* ---------------- Services ---------------- */}
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
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-2" style={{ backgroundColor: s.color }}>
                    {s.icon}
                  </div>
                  <p className="text-xs font-semibold text-center text-gray-900 dark:text-gray-100">{s.title}</p>
                </motion.a>
              ))}
            </div>
          </div>
        </div>
      </BannersWrapper>
    </ResponsiveLandingWrapper>
  );
}
