"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api";
import ResponsiveLandingWrapper from "@/components/ResponsiveLandingWrapper";
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

const PREFIX_MAP: Record<string, string[]> = {
  mtn: ["0803","0806","0703","0706","0810","0813","0814","0816","0903","0906","0913","0916"],
  glo: ["0805","0807","0705","0811","0815","0905"],
  airtel: ["0802","0808","0701","0708","0812","0901","0902","0904","0912"],
  etisalat: ["0809","0817","0818","0908","0909"],
};

export default function AirtimePage() {
  const [stage, setStage] = useState<Stage>("form");
  const [phone, setPhone] = useState("");
  const [amount, setAmount] = useState("");
  const [serviceID, setServiceID] = useState("");
  const [recentPhones, setRecentPhones] = useState<string[]>([]);
  const [verified, setVerified] = useState(false);

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

  /* ================= AUTO NETWORK DETECT ================= */
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

  /* ================= PAYSTACK CALLBACK ================= */
  useEffect(() => {
    if (authLoading || verified) return;

    const ref = new URLSearchParams(window.location.search).get("ref");
    if (!ref) return;

    setVerified(true);

    // Only show success/error; actual purchase handled in webhook
    setStage("success");
    saveRecentPhone(phone);
  }, [authLoading, verified]);

  /* ================= PAYMENT ================= */
  const startPayment = async () => {
    if (!phone || !amount || !serviceID) return;

    try {
      setStage("paying");

      const reference = `AIRTIME-${Date.now()}`;
      const email = user?.email ?? "guest@nexa.com.ng";

      const init = await api.post("/paystack/initialize", {
        email,
        amount: Number(amount) * 100,
        reference,
        metadata: {
          purpose: "airtime_purchase",
          phone,
          serviceID,
          amount: Number(amount),
        },
        callback_url: `${window.location.origin}/airtime?ref=${reference}`,
      });

      window.location.href = init.data.data.authorization_url;
    } catch {
      setStage("error");
    }
  };

  /* ================= HELPERS ================= */
  const saveRecentPhone = (phone: string) => {
    const updated = [phone, ...recentPhones.filter(p => p !== phone)].slice(0, 5);
    localStorage.setItem(LS_RECENT_PHONES, JSON.stringify(updated));
    setRecentPhones(updated);
  };

  /* ================= UI ================= */
  const steps = ["Details", "Review", "Payment", "Complete"];
  const stageIndex = ["form","review","paying","success","error"].indexOf(stage);
  const selectedNetwork = NETWORKS.find(n => n.id === serviceID);

  return (
    <ResponsiveLandingWrapper>
      <BannersWrapper page="airtime">
        <div className="max-w-md mx-auto px-4">

          {/* ===== WIZARD HEADER ===== */}
          <div className="flex items-center justify-between mb-8">
            {steps.map((_, idx) => {
              const active = idx <= stageIndex;
              return (
                <div key={idx} className="flex-1 flex items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2
                    ${active ? "bg-yellow-500 border-yellow-500 text-white"
                             : "bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 text-gray-500"}`}>
                    {idx + 1}
                  </div>
                  {idx < steps.length - 1 && (
                    <div className={`flex-1 h-1 -ml-1 ${idx < stageIndex ? "bg-yellow-500" : "bg-gray-300 dark:bg-gray-700"}`} />
                  )}
                </div>
              );
            })}
          </div>

          {/* ================= CONTENT ================= */}
          <AnimatePresence mode="wait">
            {stage === "form" && (
              <motion.div key="form" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                className="bg-white dark:bg-gray-900 rounded-lg shadow-md p-6 space-y-4">
                <h2 className="text-xl font-bold">Buy Airtime</h2>

                <div className="grid grid-cols-4 gap-3">
                  {NETWORKS.map(n => (
                    <button key={n.id} onClick={() => setServiceID(n.id)}
                      className={`border rounded-lg p-3 flex flex-col items-center
                        ${serviceID === n.id ? "border-yellow-500 ring-2 ring-yellow-400"
                                             : "border-gray-200 dark:border-gray-700"}`}>
                      <Image src={n.icon} alt={n.label} width={32} height={32} />
                      <span className="text-xs font-semibold mt-1">{n.label}</span>
                    </button>
                  ))}
                </div>

                <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="Phone number"
                  className="w-full p-3 border rounded focus:ring-2 focus:ring-yellow-400 dark:bg-gray-800 dark:border-gray-700 dark:text-white" />

                {recentPhones.length > 0 && (
                  <div className="flex gap-2 overflow-x-auto">
                    {recentPhones.map(p => (
                      <button key={p} onClick={() => setPhone(p)}
                        className="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-sm">
                        {p}
                      </button>
                    ))}
                  </div>
                )}

                <button onClick={() => setStage("review")} disabled={!phone || !serviceID}
                  className="w-full bg-yellow-500 hover:bg-yellow-600 text-white py-3 rounded font-semibold disabled:opacity-60">
                  Review
                </button>
              </motion.div>
            )}

            {stage === "review" && (
              <motion.div key="review" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                className="bg-white dark:bg-gray-900 rounded-lg shadow-md p-6 space-y-4">
                <h2 className="text-xl font-bold">Review</h2>
                <p><b>Network:</b> {selectedNetwork?.label}</p>
                <p><b>Phone:</b> {phone}</p>

                <input value={amount} onChange={e => setAmount(e.target.value)} placeholder="Amount"
                  className="w-full p-3 border rounded focus:ring-2 focus:ring-yellow-400 dark:bg-gray-800 dark:border-gray-700 dark:text-white" />

                <div className="flex gap-3">
                  <button onClick={() => setStage("form")} className="flex-1 bg-gray-200 dark:bg-gray-700 py-3 rounded">
                    Back
                  </button>
                  <button onClick={startPayment} disabled={!amount || authLoading}
                    className="flex-1 bg-yellow-500 text-white py-3 rounded">
                    Pay
                  </button>
                </div>
              </motion.div>
            )}

            {stage === "paying" && (
              <div className="bg-white dark:bg-gray-900 p-6 rounded text-center">
                Redirecting to Paystack…
              </div>
            )}

            {stage === "success" && (
              <div className="bg-green-100 dark:bg-green-900 p-6 rounded text-center">
                <h2 className="text-xl font-bold">Airtime Purchased 🎉</h2>
                <button onClick={() => window.location.reload()}
                  className="mt-4 bg-yellow-500 text-white py-3 w-full rounded">
                  Buy Again
                </button>
              </div>
            )}

            {stage === "error" && (
              <div className="bg-red-100 dark:bg-red-900 p-6 rounded text-center">
                Transaction failed
                <button onClick={() => setStage("form")}
                  className="mt-4 bg-yellow-500 text-white py-3 w-full rounded">
                  Retry
                </button>
              </div>
            )}
          </AnimatePresence>
        </div>
      </BannersWrapper>
    </ResponsiveLandingWrapper>
  );
}
