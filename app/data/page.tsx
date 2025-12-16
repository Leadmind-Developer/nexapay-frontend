"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import api from "@/lib/api";
import ResponsiveLandingWrapper from "@/components/ResponsiveLandingWrapper";
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

type Stage = "form" | "review" | "paying" | "pending" | "success" | "error";

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

/* ================= PAGE ================= */
export default function DataPurchasePage() {
  const [stage, setStage] = useState<Stage>("form");

  const [provider, setProvider] = useState<Provider | null>(null);
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  const [variations, setVariations] = useState<Variation[]>([]);
  const [selectedVar, setSelectedVar] = useState<Variation | null>(null);

  const [loadingPlans, setLoadingPlans] = useState(false);
  const [processing, setProcessing] = useState(false);

  const [recentPhones, setRecentPhones] = useState<string[]>([]);

  /* ================= RECENTS ================= */
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("recentDataPhones") || "[]");
    setRecentPhones(stored);
  }, []);

  const saveRecentPhone = (num: string) => {
    const updated = [num, ...recentPhones.filter(p => p !== num)].slice(0, 5);
    localStorage.setItem("recentDataPhones", JSON.stringify(updated));
    setRecentPhones(updated);
  };

  /* ================= AUTO PROVIDER DETECT ================= */
  useEffect(() => {
    if (phone.length < 4) return;

    const normalized = phone.replace(/^234/, "0").slice(0, 4);

    for (const [key, prefixes] of Object.entries(PREFIX_MAP)) {
      if (prefixes.includes(normalized)) {
        const found = PROVIDERS.find(p => p.value === key);
        if (found && found.value !== provider?.value) {
          loadVariations(found);
        }
      }
    }
  }, [phone]);

  /* ================= LOAD PLANS ================= */
  const loadVariations = async (prov: Provider) => {
    setProvider(prov);
    setSelectedVar(null);
    setVariations([]);
    setLoadingPlans(true);

    try {
      const res = await api.get(`/vtpass/data/variations/${prov.value}`);
      setVariations(res.data.variations || []);
    } catch {
      alert("Failed to load data plans");
    } finally {
      setLoadingPlans(false);
    }
  };

  /* ================= PAYSTACK ================= */
  const initializePayment = async () => {
    if (!provider || !selectedVar) return;

    try {
      setProcessing(true);
      setStage("paying");

      saveRecentPhone(phone);

      const reference = `DATA-${Date.now()}`;

      const init = await api.post("/paystack/initialize", {
        email,
        amount: selectedVar.variation_amount * 100,
        reference,
        metadata: {
          purpose: "data_purchase",
          provider: provider.value,
          billersCode: phone,
          variation_code: selectedVar.variation_code,
        },
        callback_url: `${window.location.origin}/data?ref=${reference}`,
      });

      window.location.href = init.data.data.authorization_url;
    } catch {
      setProcessing(false);
      setStage("form");
      alert("Payment failed to initialize");
    }
  };

  /* ================= VERIFY ================= */
  useEffect(() => {
    const ref = new URL(window.location.href).searchParams.get("ref");
    if (!ref) return;

    const verify = async () => {
      try {
        setStage("pending");
        const res = await api.get(`/paystack/verify/${ref}`);
        if (res.data.status === "success") setStage("success");
        else setStage("error");
      } catch {
        setStage("error");
      }
    };

    verify();
  }, []);

  /* ================= WIZARD ================= */
  const steps = ["Details", "Review", "Payment", "Complete"];
  const stageIndex = ["form","review","paying","pending","success","error"].indexOf(stage);

  return (
    <ResponsiveLandingWrapper>
      <BannersWrapper page="data">
        <div className="max-w-md mx-auto px-4">

          {/* ===== WIZARD HEADER (SAME AS CABLE) ===== */}
          <div className="flex items-center justify-between mb-8">
            {steps.map((_, idx) => {
              const active = idx <= stageIndex;
              return (
                <div key={idx} className="flex-1 flex items-center">
                  <motion.div
                    className={`w-10 h-10 rounded-full flex items-center justify-center border-2
                      ${active ? "bg-yellow-500 border-yellow-500 text-white" : "bg-white border-gray-300 text-gray-500"}`}
                  >
                    {idx + 1}
                  </motion.div>
                  {idx < steps.length - 1 && (
                    <motion.div
                      className="flex-1 h-1 -ml-1"
                      animate={{ backgroundColor: idx < stageIndex ? "#F59E0B" : "#D1D5DB" }}
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* ===== FORM ===== */}
          {stage === "form" && (
            <div className="bg-white shadow-md rounded-lg p-6 space-y-4">
              <h2 className="text-xl font-bold">Buy Data</h2>

              <div className="relative">
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full p-3 border rounded focus:ring-2 focus:ring-yellow-400"
                  placeholder="Phone Number"
                />
                {recentPhones.length > 0 && phone && (
                  <ul className="absolute z-10 w-full bg-white border rounded mt-1">
                    {recentPhones.filter(p => p.includes(phone)).map(p => (
                      <li key={p} onClick={() => setPhone(p)} className="p-2 hover:bg-gray-100 cursor-pointer">
                        {p}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 border rounded focus:ring-2 focus:ring-yellow-400"
                placeholder="Email"
              />

              {/* Providers */}
              <div className="grid grid-cols-3 gap-3">
                {PROVIDERS.map(p => (
                  <button
                    key={p.value}
                    onClick={() => loadVariations(p)}
                    className={`border rounded-lg p-3 flex flex-col items-center
                      ${provider?.value === p.value ? "border-yellow-500 ring-2 ring-yellow-400" : ""}`}
                  >
                    <Image src={p.icon} alt={p.label} width={36} height={36} />
                    <span className="text-xs mt-1 font-semibold">{p.label}</span>
                  </button>
                ))}
              </div>

              {!loadingPlans && variations.length > 0 && (
                <select
                  className="w-full p-3 border rounded focus:ring-2 focus:ring-yellow-400"
                  value={selectedVar?.variation_code || ""}
                  onChange={e =>
                    setSelectedVar(
                      variations.find(v => v.variation_code === e.target.value) || null
                    )
                  }
                >
                  <option value="">Select Data Bundle</option>
                  {variations.map(v => (
                    <option key={v.variation_code} value={v.variation_code}>
                      {v.name} — ₦{v.variation_amount}
                    </option>
                  ))}
                </select>
              )}

              <button
                disabled={!provider || !phone || !email || !selectedVar}
                onClick={() => setStage("review")}
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-white py-3 rounded font-semibold"
              >
                Review
              </button>
            </div>
          )}

          {/* ===== REVIEW ===== */}
          {stage === "review" && (
            <motion.div className="bg-white shadow-md rounded-lg p-6 space-y-3">
              <h2 className="text-xl font-bold">Review</h2>
              <p><b>Provider:</b> {provider?.label}</p>
              <p><b>Phone:</b> {phone}</p>
              <p><b>Plan:</b> {selectedVar?.name}</p>
              <p><b>Amount:</b> ₦{selectedVar?.variation_amount}</p>

              <div className="flex gap-3">
                <button onClick={() => setStage("form")} className="flex-1 bg-gray-200 py-3 rounded">
                  Back
                </button>
                <button onClick={initializePayment} className="flex-1 bg-yellow-500 text-white py-3 rounded">
                  Pay
                </button>
              </div>
            </motion.div>
          )}

          {(stage === "paying" || stage === "pending") && (
            <div className="bg-white shadow-md rounded-lg p-6 text-center">
              <p className="py-10">
                {stage === "paying" ? "Redirecting to Paystack…" : "Processing…"}
              </p>
            </div>
          )}

          {stage === "success" && (
            <div className="bg-green-100 p-6 rounded text-center">
              <h2 className="text-xl font-bold">Data Purchase Successful 🎉</h2>
              <button onClick={() => window.location.reload()} className="mt-4 bg-yellow-500 text-white py-3 w-full rounded">
                Buy Again
              </button>
            </div>
          )}

          {stage === "error" && (
            <div className="bg-red-100 p-6 rounded text-center">
              <p>❌ Transaction failed</p>
              <button onClick={() => setStage("form")} className="mt-4 bg-yellow-500 text-white py-3 w-full rounded">
                Retry
              </button>
            </div>
          )}

        </div>
      </BannersWrapper>
    </ResponsiveLandingWrapper>
  );
}
