"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api";
import BannersWrapper from "@/components/BannersWrapper";
import { useAuth } from "@/hooks/useAuth";

type Network = { id: string; label: string; icon: string };
type Stage = "form" | "review" | "paying" | "success" | "error";

const NETWORKS: Network[] = [
  { id: "mtn", label: "MTN", icon: "/images/icons/MTN_logo.png" },
  { id: "glo", label: "Glo", icon: "/images/icons/Glo_button.png" },
  { id: "airtel", label: "Airtel", icon: "/images/icons/Airtel_logo.png" },
  { id: "etisalat", label: "9Mobile", icon: "/images/icons/9Mobile-Telecom-Logo.jpg" },
];

const LS_NETWORK_KEY = "nexa:lastNetwork";
const LS_RECENT_PHONES = "nexa:recentPhones";

export default function AirtimePage() {
  const [stage, setStage] = useState<Stage>("form");
  const [phone, setPhone] = useState("");
  const [amount, setAmount] = useState("");
  const [serviceID, setServiceID] = useState("");
  const [recentPhones, setRecentPhones] = useState<string[]>([]);
  const [errorMsg, setErrorMsg] = useState("");

  const { user, isAuthenticated, loading: authLoading } = useAuth();

  /* ================= INIT ================= */
  useEffect(() => {
    const lastNetwork = localStorage.getItem(LS_NETWORK_KEY);
    if (lastNetwork) setServiceID(lastNetwork);

    const stored = JSON.parse(localStorage.getItem(LS_RECENT_PHONES) || "[]");
    setRecentPhones(stored);
  }, []);

  useEffect(() => {
    if (serviceID) localStorage.setItem(LS_NETWORK_KEY, serviceID);
  }, [serviceID]);

  /* ================= CHECKOUT ================= */
  const checkout = async () => {
    if (!phone || !amount || !serviceID) return;

    try {
      setStage("paying");
      setErrorMsg("");

      const res = await api.post("/vtpass/airtime/checkout", {
        phone,
        amount: Number(amount),
        serviceID,
      });

      const data = res.data;

      if (data.status === "paystack" && data.authorization_url) {
        window.location.href = data.authorization_url;
        return;
      }

      if (data.status === "success") {
        saveRecentPhone(phone);
        setStage("success");
        return;
      }

      throw new Error(data.message || "Transaction failed");
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || "Airtime purchase failed");
      setStage("error");
    }
  };

  /* ================= HELPERS ================= */
  const saveRecentPhone = (phone: string) => {
    const updated = [phone, ...recentPhones.filter(p => p !== phone)].slice(0, 5);
    localStorage.setItem(LS_RECENT_PHONES, JSON.stringify(updated));
    setRecentPhones(updated);
  };

  const selectedNetwork = NETWORKS.find(n => n.id === serviceID);

  /* ================= UI ================= */
  return (
    <BannersWrapper page="airtime">
      <div className="max-w-md mx-auto px-4">
        <AnimatePresence mode="wait">

          {/* ================= FORM ================= */}
          {stage === "form" && (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white dark:bg-gray-900 rounded-lg shadow-md p-6 space-y-4"
            >
              <h2 className="text-xl font-bold">Buy Airtime</h2>

              <div className="grid grid-cols-4 gap-3">
                {NETWORKS.map(n => (
                  <button
                    key={n.id}
                    onClick={() => setServiceID(n.id)}
                    className={`border rounded-lg p-3 flex flex-col items-center
                      ${serviceID === n.id ? "border-yellow-500 ring-2 ring-yellow-400"
                        : "border-gray-200 dark:border-gray-700"}`}
                  >
                    <Image src={n.icon} alt={n.label} width={32} height={32} />
                    <span className="text-xs font-semibold mt-1">{n.label}</span>
                  </button>
                ))}
              </div>

              <input
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="Phone number"
                className="w-full p-3 border rounded dark:bg-gray-800"
              />

              <button
                onClick={() => setStage("review")}
                disabled={!phone || !serviceID}
                className="w-full bg-yellow-500 text-white py-3 rounded"
              >
                Review
              </button>
            </motion.div>
          )}

          {/* ================= REVIEW ================= */}
          {stage === "review" && (
            <motion.div
              key="review"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white dark:bg-gray-900 rounded-lg shadow-md p-6 space-y-4"
            >
              <h2 className="text-xl font-bold">Review</h2>

              <p><b>Network:</b> {selectedNetwork?.label}</p>
              <p><b>Phone:</b> {phone}</p>

              <input
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="Amount"
                className="w-full p-3 border rounded dark:bg-gray-800"
              />

              <div className="flex gap-3">
                <button
                  onClick={() => setStage("form")}
                  className="flex-1 bg-gray-200 dark:bg-gray-700 py-3 rounded"
                >
                  Back
                </button>
                <button
                  onClick={checkout}
                  disabled={!amount || authLoading}
                  className="flex-1 bg-yellow-500 text-white py-3 rounded"
                >
                  Buy Airtime
                </button>
              </div>
            </motion.div>
          )}

          {stage === "paying" && (
            <div className="bg-white dark:bg-gray-900 p-6 rounded text-center">
              Processing…
            </div>
          )}

          {stage === "success" && (
            <div className="bg-green-100 dark:bg-green-900 p-6 rounded text-center">
              <h2 className="text-xl font-bold">Airtime Sent 🎉</h2>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 bg-yellow-500 text-white py-3 w-full rounded"
              >
                Buy Again
              </button>
            </div>
          )}

          {stage === "error" && (
            <div className="bg-red-100 dark:bg-red-900 p-6 rounded text-center">
              {errorMsg}
            </div>
          )}

        </AnimatePresence>
      </div>
    </BannersWrapper>
  );
}
