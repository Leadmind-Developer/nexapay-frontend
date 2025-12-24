"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import api from "@/lib/api";
import BannersWrapper from "@/components/BannersWrapper";

/* ================= TYPES ================= */
type Network = { label: string; value: string; icon: string };
type Stage = "form" | "review" | "processing" | "success" | "error";
type AirtimeReceipt = any;

/* ================= NETWORKS & VTpass MAPPING ================= */
const NETWORKS: Network[] = [
  { label: "MTN", value: "mtn", icon: "/images/icons/MTN_logo.png" },
  { label: "GLO", value: "glo", icon: "/images/icons/Glo_button.png" },
  { label: "Airtel", value: "airtel", icon: "/images/icons/Airtel_logo.png" },
  { label: "9Mobile", value: "etisalat", icon: "/images/icons/9Mobile-Telecom-Logo.jpg" },
];

const SERVICE_ID_MAP: Record<string, string> = {
  mtn: "mtn",
  glo: "glo",
  airtel: "airtel",
  etisalat: "etisalat",
};

/* ================= PREFIX MAP ================= */
const PREFIX_MAP: Record<string, string[]> = {
  mtn: ["0703","0706","0803","0806","0810","0813","0814","0816","0903","0906","0913","0916"],
  glo: ["0705","0805","0807","0811","0815","0905"],
  airtel: ["0701","0708","0802","0808","0812","0901","0902","0904","0912"],
  etisalat: ["0709","0809","0817","0818","0908","0909"],
};

/* ================= LOCAL STORAGE KEYS ================= */
const LS_NETWORK_KEY = "nexa:lastAirtimeNetwork";
const LS_RECENT_PHONES = "nexa:recentAirtimePhones";

/* ================= PAGE ================= */
export default function AirtimePage() {
  const [stage, setStage] = useState<Stage>("form");
  const [phone, setPhone] = useState("");
  const [amount, setAmount] = useState("");
  const [network, setNetwork] = useState<Network | null>(null);
  const [receipt, setReceipt] = useState<AirtimeReceipt | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [recentPhones, setRecentPhones] = useState<string[]>([]);

  /* ========== Load from localStorage ========== */
  useEffect(() => {
    const last = localStorage.getItem(LS_NETWORK_KEY);
    if (last) setNetwork(NETWORKS.find(n => n.value === last) || null);

    const stored = JSON.parse(localStorage.getItem(LS_RECENT_PHONES) || "[]");
    setRecentPhones(stored);
  }, []);

  useEffect(() => {
    if (network) localStorage.setItem(LS_NETWORK_KEY, network.value);
  }, [network]);

  /* ========== Auto detect network by phone prefix ========== */
  useEffect(() => {
    if (phone.length < 4) return;
    const prefix = phone.replace(/\s+/g, "").slice(0, 4);
    for (const [key, list] of Object.entries(PREFIX_MAP)) {
      if (list.includes(prefix)) {
        const found = NETWORKS.find(n => n.value === key);
        if (found && found.value !== network?.value) {
          setNetwork(found);
        }
        return;
      }
    }
  }, [phone]);

  /* ========== CHECKOUT ========== */
  const checkout = async () => {
    if (!phone || !amount || !network) return;

    try {
      setStage("processing");
      setErrorMessage("");

      const res = await api.post(
        "/vtpass/airtime/local",
        {
          phone,
          amount: Number(amount),
          serviceID: network.value,
        },
        { withCredentials: true }
      );

      // Wallet success
      if (res.data.status === "success") {
        const vtpassTx = res.data.vtpass.vtpassTransaction;
        setReceipt(vtpassTx);
        setStage("success");

        // update recent phones
        const updated = [phone, ...recentPhones.filter(p => p !== phone)].slice(0, 5);
        setRecentPhones(updated);
        localStorage.setItem(LS_RECENT_PHONES, JSON.stringify(updated));
        return;
      }

      // Paystack fallback
      if (res.data.status === "paystack" && res.data.authorization_url) {
        window.location.href = res.data.authorization_url;
        return;
      }

      // Generic error
      setErrorMessage(res.data.message || "Transaction failed");
      setStage("error");
    } catch (err: any) {
      console.error("Airtime purchase error:", err);
      setErrorMessage(err?.response?.data?.message || "Something went wrong. Please try again.");
      setStage("error");
    }
  };

  /* ========== RENDER ========== */
  return (
    <BannersWrapper page="airtime">
      <div className="max-w-md mx-auto px-4 space-y-6">

        {stage === "form" && (
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md p-6 space-y-4">
            <h2 className="text-xl font-bold">Buy Airtime</h2>

            <div className="grid grid-cols-4 gap-3">
              {NETWORKS.map(n => (
                <button
                  key={n.value}
                  onClick={() => setNetwork(n)}
                  className={`border rounded-lg p-3 flex flex-col items-center
                    ${network?.value === n.value ? "border-yellow-500 ring-2 ring-yellow-400" : "border-gray-200 dark:border-gray-700"}`}
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
              onClick={() => setStage("review")}
              disabled={!phone || !amount || !network}
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-white py-3 rounded font-semibold disabled:opacity-60"
            >
              Review
            </button>
          </div>
        )}

        {stage === "review" && network && (
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md p-6 space-y-4">
            <p><b>Network:</b> {network.label}</p>
            <p><b>Phone:</b> {phone}</p>
            <p><b>Amount:</b> ₦{amount}</p>

            <div className="flex gap-3">
              <button onClick={() => setStage("form")} className="flex-1 bg-gray-200 dark:bg-gray-700 py-3 rounded">Back</button>
              <button onClick={checkout} className="flex-1 bg-yellow-500 text-white py-3 rounded">Pay</button>
            </div>
          </div>
        )}

        {stage === "processing" && (
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md p-6 text-center">
            Processing your airtime purchase…
          </div>
        )}

        {stage === "success" && receipt && (
          <div className="bg-green-100 dark:bg-green-900 rounded-lg p-6 text-center space-y-3">
            <h2 className="text-xl font-bold">Airtime Purchased 🎉</h2>
            <p>Phone: {receipt.phone}</p>
            <p>Amount: ₦{receipt.amount}</p>
            <p>Network: {network?.label}</p>
            <button
              onClick={() => {
                setStage("form");
                setPhone("");
                setAmount("");
                setNetwork(null);
                setReceipt(null);
                setErrorMessage("");
              }}
              className="mt-4 bg-yellow-500 text-white py-3 w-full rounded"
            >
              Buy Again
            </button>
          </div>
        )}

        {stage === "error" && (
          <div className="bg-red-100 dark:bg-red-900 rounded-lg p-6 text-center space-y-3">
            <h2 className="text-lg font-bold">Transaction Failed</h2>
            <p>{errorMessage}</p>
            <button onClick={() => setStage("form")} className="mt-4 bg-yellow-500 text-white py-3 w-full rounded">
              Retry
            </button>
          </div>
        )}

      </div>
    </BannersWrapper>
  );
}
