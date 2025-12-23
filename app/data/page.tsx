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

  const [provider, setProvider] = useState<Provider | null>(null);
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  const [variations, setVariations] = useState<Variation[]>([]);
  const [selectedVar, setSelectedVar] = useState<Variation | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  /* ================= AUTO PROVIDER (PHONE) ================= */
  useEffect(() => {
    if (phone.length < 4) return;
    const prefix = phone.slice(0, 4);

    for (const [key, list] of Object.entries(PREFIX_MAP)) {
      if (list.includes(prefix)) {
        const found = PROVIDERS.find(p => p.value === key);
        if (found && found.value !== provider?.value) {
          loadVariations(found);
        }
      }
    }
  }, [phone]);

  /* ================= AUTO PROVIDER (EMAIL → SMILE) ================= */
  useEffect(() => {
    if (!email) return;
    if (email.toLowerCase().includes("@smile")) {
      const smile = PROVIDERS.find(p => p.value === "smile");
      if (smile && smile.value !== provider?.value) {
        loadVariations(smile);
      }
    }
  }, [email]);

  /* ================= LOAD PLANS ================= */
  const loadVariations = async (prov: Provider) => {
    setProvider(prov);
    setSelectedVar(null);
    setVariations([]);

    try {
      const res = await api.get(`/vtpass/data/variations/${prov.value}`);
      setVariations(res.data.variations || []);
    } catch {
      alert("Failed to load data plans");
    }
  };

  /* ================= CHECKOUT (WALLET FIRST) ================= */
  const checkout = async () => {
    if (!provider || !selectedVar) return;

    try {
      setStage("processing");
      setErrorMessage(null);

      const res = await api.post(
        "/vtpass/data/checkout",
        {
          provider: provider.value,
          billersCode: phone,
          variation_code: selectedVar.variation_code,
        },
        { withCredentials: true }
      );

      // Wallet was sufficient → VTpass triggered server-side
      if (res.data.status === "success") {
        setStage("success");
        return;
      }

      // Wallet insufficient → Paystack required
      if (res.data.status === "paystack") {
        window.location.href = res.data.authorization_url;
        return;
      }

      setStage("error");
      setErrorMessage("Something went wrong. Please check your transaction history.");
    } catch (err: any) {
      if (err.response) {
        setErrorMessage(err.response.data.error || "An unexpected error occurred");
        if (err.response.status === 402) {
          setErrorMessage("Insufficient wallet balance");
        }
        } else {
        setErrorMessage("Network or server error. Please try again later.");
      }
      setStage("error");
    }
  };

  return (
    <BannersWrapper page="data">
      <div className="max-w-md mx-auto px-4 text-gray-900 dark:text-gray-100">

        {/* ===== FORM ===== */}
        {stage === "form" && (
          <div className="bg-white dark:bg-gray-900 border dark:border-gray-800 rounded-lg p-6 space-y-4 shadow">
            <h2 className="text-xl font-bold">Buy Data</h2>

            <input
              value={phone}
              onChange={e => setPhone(normalizePhone(e.target.value))}
              className="w-full p-3 border rounded dark:bg-gray-900 dark:border-gray-700"
              placeholder="Phone Number or Smile Email"
            />

            <input
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full p-3 border rounded dark:bg-gray-900 dark:border-gray-700"
              placeholder="Receipt Email"
            />

            <div className="grid grid-cols-3 gap-3">
              {PROVIDERS.map(p => (
                <button
                  key={p.value}
                  onClick={() => loadVariations(p)}
                  className={`border rounded-lg p-3 flex flex-col items-center
                    ${provider?.value === p.value
                      ? "border-yellow-500 ring-2 ring-yellow-400"
                      : "dark:border-gray-700"}`}
                >
                  <Image src={p.icon} alt={p.label} width={36} height={36} />
                  <span className="text-xs mt-1 font-semibold">{p.label}</span>
                </button>
              ))}
            </div>

            {variations.length > 0 && (
              <select
                className="w-full p-3 border rounded dark:bg-gray-900 dark:border-gray-700"
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
              className="w-full bg-yellow-500 text-white py-3 rounded font-semibold"
            >
              Review
            </button>
          </div>
        )}

        {/* ===== REVIEW ===== */}
        {stage === "review" && (
          <div className="bg-white dark:bg-gray-900 border dark:border-gray-800 rounded-lg p-6 space-y-3 shadow">
            <p><b>Provider:</b> {provider?.label}</p>
            <p><b>Recipient:</b> {phone}</p>
            <p><b>Plan:</b> {selectedVar?.name}</p>
            <p><b>Amount:</b> ₦{selectedVar?.variation_amount}</p>

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
            <h2 className="text-xl font-bold">Data Purchase Successful 🎉</h2>
            <p className="text-sm mt-2">
              Your data bundle is being delivered. You’ll receive confirmation shortly.
            </p>
          </div>
        )}

        {stage === "error" && (
          <div className="bg-red-100 dark:bg-red-900 border dark:border-red-800 p-6 rounded text-center space-y-3">
            <h2 className="text-lg font-bold">Error</h2>
            <p className="text-sm">{errorMessage}</p>
              Your wallet or payment may have been processed. Please check your transaction history.
            </p>
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
