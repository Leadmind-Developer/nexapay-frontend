"use client";

import { useState } from "react";
import api from "@/lib/api";
import BannersWrapper from "@/components/BannersWrapper";
import { useCheckout } from "@/hooks/useCheckout";

/* ================= TYPES ================= */
type Variation = {
  variation_code: string;
  name: string;
  variation_amount: number;
};

type Stage = "verify" | "payment";

/* ================= SERVICES ================= */
const SERVICES = [
  { label: "DStv", value: "dstv" },
  { label: "GOtv", value: "gotv" },
  { label: "Startimes", value: "startimes" },
  { label: "Showmax", value: "showmax" },
];

/* ================= PAGE ================= */
export default function CablePage() {
  const [serviceId, setServiceId] = useState("");
  const [smartcard, setSmartcard] = useState("");
  const [phone, setPhone] = useState("");

  const [customerName, setCustomerName] = useState("");
  const [variations, setVariations] = useState<Variation[]>([]);
  const [selectedVar, setSelectedVar] = useState<Variation | null>(null);

  const [stage, setStage] = useState<Stage>("verify");
  const [verifying, setVerifying] = useState(false);

  const {
    stage: checkoutStage,
    checkout,
    errorMessage,
    reference,
  } = useCheckout();

  /* ================= VERIFY SMARTCARD ================= */
  const verifySmartcard = async () => {
    if (!serviceId || !smartcard) return;

    try {
      setVerifying(true);
      setCustomerName("");
      setVariations([]);
      setSelectedVar(null);

      const res = await api.post("/vtpass/cable/verify", {
        service: serviceId,
        smartcard,
      });

      const content = res.data?.content || {};
      const name =
        content.customer_name ||
        content.Customer_Name ||
        content.customerName ||
        content.name ||
        "";

      if (!name) {
        throw new Error("Unable to verify smartcard");
      }

      setCustomerName(name);

      const vars = await api.get(
        `/vtpass/cable/variations?service=${serviceId}`
      );

      setVariations(vars.data?.variations || []);
      setStage("payment");
    } catch (err: any) {
      alert(
        err?.response?.data?.error ||
          err?.message ||
          "Smartcard verification failed"
      );
    } finally {
      setVerifying(false);
    }
  };

  /* ================= CHECKOUT ================= */
  const handleCheckout = () => {
    if (!selectedVar || !phone) return;

    checkout({
      endpoint: "/vtpass/cable/checkout",
      payload: {
        serviceId,
        smartcard,
        variation_code: selectedVar.variation_code,
        amount: selectedVar.variation_amount,
        phone,
      },
    });
  };

  /* ================= UI ================= */
  return (
    <BannersWrapper page="cable">
      <div className="max-w-md mx-auto px-4 space-y-4 text-gray-900 dark:text-gray-100">

        {/* ===== VERIFY ===== */}
        {stage === "verify" && (
          <div className="bg-white dark:bg-gray-900 border dark:border-gray-800 rounded-lg p-6 space-y-4 shadow">
            <h2 className="text-xl font-bold">Verify Smartcard</h2>

            <select
              value={serviceId}
              onChange={e => setServiceId(e.target.value)}
              className="w-full p-3 border rounded dark:bg-gray-900 dark:border-gray-700"
            >
              <option value="">Select Provider</option>
              {SERVICES.map(s => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>

            <input
              value={smartcard}
              onChange={e => setSmartcard(e.target.value)}
              placeholder="Smartcard Number"
              className="w-full p-3 border rounded dark:bg-gray-900 dark:border-gray-700"
            />

            <button
              onClick={verifySmartcard}
              disabled={verifying}
              className="w-full bg-yellow-500 text-white py-3 rounded font-semibold disabled:opacity-60"
            >
              {verifying ? "Verifying…" : "Verify Smartcard"}
            </button>
          </div>
        )}

        {/* ===== PAYMENT ===== */}
        {stage === "payment" && (
          <div className="bg-white dark:bg-gray-900 border dark:border-gray-800 rounded-lg p-6 space-y-4 shadow">
            <h2 className="text-xl font-bold">Payment</h2>

            <p className="text-sm">
              <b>Customer:</b> {customerName}
            </p>

            <select
              value={selectedVar?.variation_code || ""}
              onChange={e =>
                setSelectedVar(
                  variations.find(v => v.variation_code === e.target.value) ||
                    null
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

            <input
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="Phone Number"
              className="w-full p-3 border rounded dark:bg-gray-900 dark:border-gray-700"
            />

            <div className="flex gap-3">
              <button
                onClick={() => setStage("verify")}
                className="flex-1 bg-gray-200 dark:bg-gray-700 py-3 rounded"
              >
                Back
              </button>
              <button
                onClick={handleCheckout}
                className="flex-1 bg-yellow-500 text-white py-3 rounded font-semibold"
              >
                Pay
              </button>
            </div>
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
            <h2 className="text-xl font-bold">
              Cable Subscription Successful 📺
            </h2>

            {reference && (
              <p className="text-xs break-all">
                <b>Reference:</b> {reference}
              </p>
            )}

            <p className="text-sm opacity-80">
              Redirecting to transactions…
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
  );
}
