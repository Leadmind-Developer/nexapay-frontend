"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api";
import BannersWrapper from "@/components/BannersWrapper";

/* ================= TYPES ================= */
type Network = { id: string; label: string; icon: string };
type Stage = "form" | "review" | "processing" | "success" | "error";
type AirtimeReceipt = any;

/* ================= DATA ================= */
const NETWORKS: Network[] = [
  { id: "mtn", label: "MTN", icon: "/images/icons/MTN_logo.png" },
  { id: "glo", label: "Glo", icon: "/images/icons/Glo_button.png" },
  { id: "airtel", label: "Airtel", icon: "/images/icons/Airtel_logo.png" },
  { id: "etisalat", label: "9Mobile", icon: "/images/icons/9Mobile-Telecom-Logo.jpg" },
];

const LS_NETWORK_KEY = "nexa:lastNetwork";
const LS_RECENT_PHONES = "nexa:recentPhones";

const PREFIX_MAP: Record<string, string[]> = {
  mtn: ["0803","0806","0703","0706","0810","0813","0814","0816","0903","0906","0913","0916"],
  glo: ["0805","0807","0705","0811","0815","0905"],
  airtel: ["0802","0808","0701","0708","0812","0901","0902","0904","0912"],
  etisalat: ["0809","0817","0818","0908","0909"],
};

/* ================= PAGE ================= */
export default function AirtimePage() {
  const [stage, setStage] = useState<Stage>("form");
  const [phone, setPhone] = useState("");
  const [amount, setAmount] = useState("");
  const [serviceID, setServiceID] = useState("");
  const [receipt, setReceipt] = useState<AirtimeReceipt | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [recentPhones, setRecentPhones] = useState<string[]>([]);

  useEffect(() => {
    const lastNetwork = localStorage.getItem(LS_NETWORK_KEY);
    if (lastNetwork) setServiceID(lastNetwork);

    const stored = JSON.parse(localStorage.getItem(LS_RECENT_PHONES) || "[]");
    setRecentPhones(stored);
  }, []);

  useEffect(() => {
    if (serviceID) localStorage.setItem(LS_NETWORK_KEY, serviceID);
  }, [serviceID]);

  // auto detect network from phone prefix
  useEffect(() => {
    if (phone.length < 4) return;
    const prefix = phone.replace(/\s+/g, "").slice(0, 4);
    for (const [key, list] of Object.entries(PREFIX_MAP)) {
      if (list.includes(prefix)) {
        setServiceID(key);
        return;
      }
    }
  }, [phone]);

  /* ================= CHECKOUT ================= */
  const checkout = async () => {
    if (!phone || !amount || !serviceID) return;

    try {
      setStage("processing");
      setErrorMessage("");

      const res = await api.post("/vtpass/airtime/local", {
        phone,
        amount,
        serviceID,
      });

      if (res.data.success) {
        setReceipt(res.data.result);
        setStage("success");

        // update recent phones
        const updated = [phone, ...recentPhones.filter(p => p !== phone)].slice(0, 5);
        setRecentPhones(updated);
        localStorage.setItem(LS_RECENT_PHONES, JSON.stringify(updated));
      } else {
        setErrorMessage(res.data.message || "Transaction failed");
        setStage("error");
      }
    } catch (err: any) {
      console.error("Airtime purchase error:", err);
      setErrorMessage(err?.response?.data?.message || "Something went wrong. Please try again.");
      setStage("error");
    }
  };

  /* ================= RENDER ================= */
  const selectedNetwork = NETWORKS.find(n => n.id === serviceID);

  return (
    <BannersWrapper page="airtime">
      <div className="max-w-md mx-auto px-4 space-y-6">

        <AnimatePresence mode="wait">
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
                      ${serviceID === n.id ? "border-yellow-500 ring-2 ring-yellow-400" : "border-gray-200 dark:border-gray-700"}`}
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
                className="w-full p-3 border rounded focus:ring-2 focus:ring-yellow-400 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              />

              {recentPhones.length > 0 && (
                <div className="flex gap-2 overflow-x-auto">
                  {recentPhones.map(p => (
                    <button key={p} onClick={() => setPhone(p)} className="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-sm">{p}</button>
                  ))}
                </div>
              )}

              <input
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="Amount"
                className="w-full p-3 border rounded focus:ring-2 focus:ring-yellow-400 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              />

              <button
                onClick={checkout}
                disabled={!phone || !amount || !serviceID}
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-white py-3 rounded font-semibold disabled:opacity-60"
              >
                Buy Airtime
              </button>
            </motion.div>
          )}

          {stage === "processing" && (
            <motion.div
              key="processing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-white dark:bg-gray-900 p-6 rounded text-center"
            >
              Processing your airtime purchase…
            </motion.div>
          )}

          {stage === "success" && (
            <motion.div
              key="success"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-green-100 dark:bg-green-900 p-6 rounded text-center space-y-3"
            >
              <h2 className="text-xl font-bold">Airtime Purchased 🎉</h2>
              <p>Phone: {receipt?.phone}</p>
              <p>Amount: ₦{receipt?.amount}</p>
              <p>Network: {selectedNetwork?.label}</p>
              <button
                onClick={() => {
                  setStage("form");
                  setPhone("");
                  setAmount("");
                  setServiceID("");
                  setReceipt(null);
                  setErrorMessage("");
                }}
                className="mt-4 bg-yellow-500 text-white py-3 w-full rounded"
              >
                Buy Again
              </button>
            </motion.div>
          )}

          {stage === "error" && (
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-red-100 dark:bg-red-900 p-6 rounded text-center space-y-3"
            >
              <h2 className="text-lg font-bold">Transaction Failed</h2>
              <p>{errorMessage}</p>
              <button
                onClick={() => setStage("form")}
                className="mt-4 bg-yellow-500 text-white py-3 w-full rounded"
              >
                Retry
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </BannersWrapper>
  );
}
