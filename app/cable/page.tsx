"use client";

import React, { useEffect, useState } from "react";
import api from "@/lib/api";
import BannersWrapper from "@/components/BannersWrapper";
import ResponsiveLandingWrapper from "@/components/ResponsiveLandingWrapper";
import { useCheckout } from "@/hooks/useCheckout";

/* ================= TYPES ================= */
type Variation = {
  variation_code: string;
  name: string;
  variation_amount: number;
};

type ServiceOption = {
  label: string;
  value: string;
};

type Stage = "form" | "processing" | "success" | "error";

/* ================= SERVICES ================= */
const SERVICES: ServiceOption[] = [
  { label: "DStv", value: "dstv" },
  { label: "GOtv", value: "gotv" },
  { label: "Startimes", value: "startimes" },
  { label: "Showmax", value: "showmax" },
];

/* ================= PAGE ================= */
export default function CablePage() {
  const [service, setService] = useState("");
  const [smartcard, setSmartcard] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  const [variations, setVariations] = useState<Variation[]>([]);
  const [selectedVar, setSelectedVar] = useState<Variation | null>(null);

  const [verifying, setVerifying] = useState(false);
  const [verifiedName, setVerifiedName] = useState("");
  const [stage, setStage] = useState<Stage>("form");

  const {
    stage: checkoutStage,
    errorMessage,
    reference,
    responseData,
    checkout,
  } = useCheckout();

  /* ================= VERIFY SMARTCARD ================= */
  useEffect(() => {
    if (!service || !smartcard) {
      setVerifiedName("");
      setVariations([]);
      setSelectedVar(null);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setVerifying(true);
        setVerifiedName("");
        setVariations([]);
        setSelectedVar(null);

        const res = await api.post("/vtpass/cable/verify", {
          service,
          smartcard,
        });

        const name = res.data?.content?.customer_name;
        if (name) {
          setVerifiedName(name);
          loadVariations(service);
        }
      } catch {
        setVerifiedName("");
      } finally {
        setVerifying(false);
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [service, smartcard]);

  /* ================= LOAD PACKAGES ================= */
  const loadVariations = async (serviceID: string) => {
    try {
      const res = await api.get(`/vtpass/cable/variations?service=${serviceID}`);
      setVariations(res.data?.variations || []);
    } catch {
      setVariations([]);
    }
  };

  /* ================= CHECKOUT ================= */
  const handleCheckout = () => {
    if (!selectedVar || !verifiedName) return;

    checkout({
      endpoint: "/vtpass/cable/checkout",
      payload: {
        service,
        smartcard,
        variation_code: selectedVar.variation_code,
        amount: selectedVar.variation_amount,
        phone,
        email,
      },
    });

    setStage("processing");
  };

  /* ================= UI ================= */
  return (
    <ResponsiveLandingWrapper>
      <BannersWrapper page="cable">
        <div className="max-w-md mx-auto px-4 space-y-4 text-gray-900 dark:text-gray-100">

          {/* ===== FORM ===== */}
          {stage === "form" && (
            <div className="bg-white dark:bg-gray-900 border dark:border-gray-800 rounded-lg p-6 space-y-4 shadow">
              <h2 className="text-xl font-bold">Cable Subscription</h2>

              <input
                value={smartcard}
                onChange={e => setSmartcard(e.target.value)}
                placeholder="Smartcard Number"
                className="w-full p-3 border rounded dark:bg-gray-900 dark:border-gray-700"
              />

              <select
                value={service}
                onChange={e => setService(e.target.value)}
                className="w-full p-3 border rounded dark:bg-gray-900 dark:border-gray-700"
              >
                <option value="">Select Provider</option>
                {SERVICES.map(s => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>

              {verifying && <p className="text-sm text-gray-500">Verifying smartcard…</p>}

              {verifiedName && (
                <p className="text-sm text-green-600">
                  Customer: <b>{verifiedName}</b>
                </p>
              )}

              {variations.length > 0 && (
                <select
                  value={selectedVar?.variation_code || ""}
                  onChange={e =>
                    setSelectedVar(
                      variations.find(v => v.variation_code === e.target.value) || null
                    )
                  }
                  className="w-full p-3 border rounded dark:bg-gray-900 dark:border-gray-700"
                >
                  <option value="">Select Package</option>
                  {variations.map(v => (
                    <option key={v.variation_code} value={v.variation_code}>
                      {v.name} — ₦{v.variation_amount}
                    </option>
                  ))}
                </select>
              )}

              <input
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="Phone Number (optional)"
                className="w-full p-3 border rounded dark:bg-gray-900 dark:border-gray-700"
              />

              <input
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Email (optional)"
                className="w-full p-3 border rounded dark:bg-gray-900 dark:border-gray-700"
              />

              <button
                disabled={!selectedVar || !verifiedName}
                onClick={handleCheckout}
                className="w-full bg-yellow-500 text-white py-3 rounded font-semibold disabled:opacity-60"
              >
                Pay
              </button>
            </div>
          )}

          {/* ===== PROCESSING ===== */}
          {checkoutStage === "processing" && (
            <div className="bg-white dark:bg-gray-900 border dark:border-gray-800 rounded-lg p-6 text-center shadow">
              Processing your cable subscription…
            </div>
          )}

          {/* ===== SUCCESS ===== */}
          {checkoutStage === "success" && (
            <div className="bg-green-100 dark:bg-green-900 border dark:border-green-800 p-6 rounded text-center space-y-3">
              <h2 className="text-xl font-bold">Cable Subscription Successful 🎉</h2>

              {reference && (
                <p className="text-xs break-all">
                  <b>Reference:</b> {reference}
                </p>
              )}

              <p className="text-sm opacity-80">
                Redirecting to transaction history…
              </p>
            </div>
          )}

          {/* ===== ERROR ===== */}
          {checkoutStage === "error" && (
            <div className="bg-red-100 dark:bg-red-900 border dark:border-red-800 p-6 rounded text-center space-y-3">
              <h2 className="text-lg font-bold">Something went wrong</h2>
              <p className="text-sm">{errorMessage}</p>
              <a
                href="/contact"
                className="inline-block bg-yellow-500 text-white py-3 px-4 rounded w-full"
              >
                Contact Support
              </a>
            </div>
          )}

        </div>
      </BannersWrapper>
    </ResponsiveLandingWrapper>
  );
}
