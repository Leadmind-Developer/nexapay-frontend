"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import api from "@/lib/api";
import BannersWrapper from "@/components/BannersWrapper";

/* ================= TYPES ================= */
type Variation = {
  variation_code: string;
  name: string;
  variation_amount: number;
};

type Provider = {
  label: string;
  value: string;
  icon: string;
};

type Stage = "form" | "review" | "processing" | "success" | "error";

/* ================= PROVIDERS ================= */
const PROVIDERS: Provider[] = [
  { label: "MTN", value: "mtn", icon: "/images/icons/MTN_logo.png" },
  { label: "GLO", value: "glo", icon: "/images/icons/Glo_button.png" },
  { label: "Airtel", value: "airtel", icon: "/images/icons/Airtel_logo.png" },
  { label: "9mobile", value: "etisalat", icon: "/images/icons/9Mobile-Telecom-Logo.jpg" },
  { label: "Spectranet", value: "spectranet", icon: "/images/icons/spectranet.png" },
  { label: "Smile", value: "smile", icon: "/images/icons/smile.png" },
];

/* ================= PREFIX MAP ================= */
const PREFIX_MAP: Record<string, string[]> = {
  mtn: ["0703","0706","0803","0806","0810","0813","0814","0816","0903","0906","0913"],
  glo: ["0705","0805","0807","0811","0815","0905"],
  airtel: ["0701","0708","0802","0808","0812","0901","0902","0904","0912"],
  etisalat: ["0709","0809","0817","0818","0908","0909"],
};

/* ================= HELPERS ================= */
const normalizePhone = (value: string) => {
  let v = value.replace(/\s+/g, "");
  if (v.startsWith("+234")) v = "0" + v.slice(4);
  else if (v.startsWith("234")) v = "0" + v.slice(3);
  return v;
};

/* ================= PAGE ================= */
export default function DataPurchasePage() {
  const [stage, setStage] = useState<Stage>("form");
  const [errorMessage, setErrorMessage] = useState<string>("");

  const [provider, setProvider] = useState<Provider | null>(null);
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [variations, setVariations] = useState<Variation[]>([]);
  const [selectedVar, setSelectedVar] = useState<Variation | null>(null);

  // ... loadVariations and provider detection logic remains unchanged

  /* ================= CHECKOUT (WALLET FIRST) ================= */
  const checkout = async () => {
    if (!provider || !selectedVar) return;

    try {
      setStage("processing");
      setErrorMessage("");

      const res = await api.post(
        "/vtpass/data/checkout",
        {
          provider: provider.value,
          billersCode: phone,
          variation_code: selectedVar.variation_code,
        },
        { withCredentials: true }
      );

      const status = res.data.status;

      // ✅ Wallet success / server processing
      if (status === "success" || status === "processing") {
        setStage("success");
        return;
      }

      // 💳 Wallet insufficient → Paystack
      if (status === "paystack" && res.data.authorization_url) {
        window.location.href = res.data.authorization_url;
        return;
      }

      // ⚠️ Any other backend error
      setErrorMessage(res.data.error || "Unable to complete transaction");
      setStage("error");
    } catch (err: any) {
      console.error("Checkout error:", err);
      const msg = err?.response?.data?.error || "Something went wrong. Please check your transaction.";
      setErrorMessage(msg);
      setStage("error");
    }
  };

  /* ================= RENDER ================= */
  return (
    <BannersWrapper page="data">
      <div className="max-w-md mx-auto px-4 text-gray-900 dark:text-gray-100">

        {/* ... FORM + REVIEW + PROCESSING unchanged ... */}

        {stage === "success" && (
          <div className="bg-green-100 dark:bg-green-900 border dark:border-green-800 p-6 rounded text-center">
            <h2 className="text-xl font-bold">Data Purchase Successful 🎉</h2>
            <p className="text-sm mt-2">
              Your data bundle is being delivered. You’ll receive confirmation shortly.
            </p>
          </div>
        )}

        {stage === "error" && (
          <div className="bg-red-50 dark:bg-red-800 border dark:border-red-700 p-6 rounded text-center space-y-3">
            <h2 className="text-lg font-bold">Transaction Failed</h2>
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

