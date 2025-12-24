"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import api from "@/lib/api";
import BannersWrapper from "@/components/BannersWrapper";

/* ================= TYPES ================= */
type Network = { label: string; value: string; icon: string };
type Stage = "form" | "review" | "processing" | "success" | "error";
type AirtimeReceipt = any;

/* ================= NETWORKS ================= */
const NETWORKS: Network[] = [
  { label: "MTN", value: "mtn", icon: "/images/icons/MTN_logo.png" },
  { label: "GLO", value: "glo", icon: "/images/icons/Glo_button.png" },
  { label: "Airtel", value: "airtel", icon: "/images/icons/Airtel_logo.png" },
  { label: "9Mobile", value: "etisalat", icon: "/images/icons/9Mobile-Telecom-Logo.jpg" },
];

/* ================= PREFIX MAP ================= */
const PREFIX_MAP: Record<string, string[]> = {
  mtn: ["0703","0706","0803","0806","0810","0813","0814","0816","0903","0906","0913","0916"],
  glo: ["0705","0805","0807","0811","0815","0905"],
  airtel: ["0701","0708","0802","0808","0812","0901","0902","0904","0912"],
  etisalat: ["0709","0809","0817","0818","0908","0909"],
};

/* ================= HELPERS ================= */
const normalizePhone = (value: string) => {
  let v = value.replace(/\s+/g, "");
  if (v.startsWith("+234")) v = "0" + v.slice(4);
  if (v.startsWith("234")) v = "0" + v.slice(3);
  return v;
};

/* ================= PAGE ================= */
export default function AirtimePage() {
  const [stage, setStage] = useState<Stage>("form");
  const [errorMessage, setErrorMessage] = useState("");

  const [phone, setPhone] = useState("");
  const [amount, setAmount] = useState("");
  const [network, setNetwork] = useState<Network | null>(null);
  const [receipt, setReceipt] = useState<AirtimeReceipt | null>(null);

  /* ========== AUTO-DETECT NETWORK ========== */
  useEffect(() => {
    if (phone.length < 4) return;
    const prefix = phone.slice(0, 4);

    for (const [key, list] of Object.entries(PREFIX_MAP)) {
      if (list.includes(prefix)) {
        const found = NETWORKS.find(n => n.value === key);
        if (found && found.value !== network?.value) setNetwork(found);
      }
    }
  }, [phone]);

  /* ================= CHECKOUT ================= */
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

      /* ✅ WALLET / VTpass SUCCESS */
      if (res.data?.success === true) {
        const tx =
          res.data.vtpass?.vtpassTransaction ||
          res.data.vtpassTransaction ||
          res.data.data;

        setReceipt(tx);
        setStage("success");
        return;
      }

      /* 💳 PAYSTACK FALLBACK */
      if (res.data?.status === "paystack" && res.data?.authorization_url) {
        window.location.href = res.data.authorization_url;
        return;
      }

      /* ⚠️ BACKEND ERROR */
      setErrorMessage(
        res.data?.message ||
        "Unable to complete this transaction. Please check your transaction history."
      );
      setStage("error");
    } catch (err: any) {
      console.error("Airtime checkout error:", err);
      setErrorMessage(
        err?.response?.data?.message ||
        "Something went wrong. Please check your transaction history."
      );
      setStage("error");
    }
  };

  return (
    <BannersWrapper page="airtime">
      <div className="max-w-md mx-auto px-4 text-gray-900 dark:text-gray-100 space-y-4">

        {/* ===== FORM ===== */}
        {stage === "form" && (
          <div className="bg-white dark:bg-gray-900 border dark:border-gray-800 rounded-lg p-6 space-y-4 shadow">
            <h2 className="text-xl font-bold">Buy Airtime</h2>

            <div className="grid grid-cols-4 gap-3">
              {NETWORKS.map(n => (
                <button
                  key={n.value}
                  onClick={() => setNetwork(n)}
                  className={`border rounded-lg p-3 flex flex-col items-center
                    ${network?.value === n.value
                      ? "border-yellow-500 ring-2 ring-yellow-400"
                      : "dark:border-gray-700"}`}
                >
                  <Image src={n.icon} alt={n.label} width={32} height={32} />
                  <span className="text-xs mt-1 font-semibold">{n.label}</span>
                </button>
              ))}
            </div>

            <input
              value={phone}
              onChange={e => setPhone(normalizePhone(e.target.value))}
              placeholder="Phone number"
              className="w-full p-3 border rounded dark:bg-gray-900 dark:border-gray-700"
            />

            <input
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="Amount"
              className="w-full p-3 border rounded dark:bg-gray-900 dark:border-gray-700"
            />

            <button
              disabled={!phone || !amount || !network}
              onClick={() => setStage("review")}
              className="w-full bg-yellow-500 text-white py-3 rounded font-semibold disabled:opacity-60"
            >
              Review
            </button>
          </div>
        )}

        {/* ===== REVIEW ===== */}
        {stage === "review" && (
          <div className="bg-white dark:bg-gray-900 border dark:border-gray-800 rounded-lg p-6 space-y-3 shadow">
            <p><b>Network:</b> {network?.label}</p>
            <p><b>Phone:</b> {phone}</p>
            <p><b>Amount:</b> ₦{amount}</p>

            <div className="flex gap-3">
              <button
                onClick={() => setStage("form")}
                className="flex-1 bg-gray-200 dark:bg-gray-700 py-3 rounded"
              >
                Back
              </button>
              <button
                onClick={checkout}
                className="flex-1 bg-yellow-500 text-white py-3 rounded"
              >
                Pay
              </button>
            </div>
          </div>
        )}

        {stage === "processing" && (
          <div className="bg-white dark:bg-gray-900 border dark:border-gray-800 rounded-lg p-6 text-center shadow">
            Processing your request…
          </div>
        )}

        {stage === "success" && (
          <div className="bg-green-100 dark:bg-green-900 border dark:border-green-800 p-6 rounded text-center">
            <h2 className="text-xl font-bold">Airtime Purchase Successful 🎉</h2>
            <p className="text-sm mt-2">
              Your airtime is being delivered. Please check your line shortly.
            </p>
          </div>
        )}

        {stage === "error" && (
          <div className="bg-red-100 dark:bg-red-900 border dark:border-red-800 p-6 rounded text-center space-y-3">
            <h2 className="text-lg font-bold">Something went wrong</h2>
            <p className="text-sm">{errorMessage}</p>
            <a
              href="/contact"
              className="inline-block mt-3 bg-yellow-500 text-white py-3 px-4 rounded w-full"
            >
              Contact Support
            </a>
          </div>
        )}

      </div>
    </BannersWrapper>
  );
}
