"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import BannersWrapper from "@/components/BannersWrapper";
import { useCheckout } from "@/hooks/useCheckout";

/* ================= TYPES ================= */
type Variation = {
  variation_code: string;
  name: string;
  variation_amount: number;
};

const SERVICES = [
  { label: "DStv", value: "dstv" },
  { label: "GOtv", value: "gotv" },
  { label: "Startimes", value: "startimes" },
  { label: "Showmax", value: "showmax" },
];

export default function CablePage() {
  const [serviceId, setServiceId] = useState("");
  const [smartcard, setSmartcard] = useState("");
  const [phone, setPhone] = useState("");

  const [verifying, setVerifying] = useState(false);
  const [verifiedName, setVerifiedName] = useState("");

  const [variations, setVariations] = useState<Variation[]>([]);
  const [selectedVar, setSelectedVar] = useState<Variation | null>(null);

  const {
    stage,
    checkout,
    errorMessage,
    reference,
  } = useCheckout();

  /* ================= VERIFY SMARTCARD ================= */
 useEffect(() => {
  if (!serviceId || smartcard.trim().length < 6) return;

  const timer = setTimeout(async () => {
    try {
      setVerifying(true);
      setVerifyError("");
      setVerifiedName("");
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
        throw new Error("Customer name not returned");
      }

      setVerifiedName(name);

      const vars = await api.get(
        `/vtpass/cable/variations?service=${serviceId}`
      );

      setVariations(vars.data?.variations || []);
    } catch (err: any) {
      setVerifiedName("");
      setVerifyError(
        err?.response?.data?.error ||
        "Smartcard verification failed"
      );
    } finally {
      setVerifying(false);
    }
  }, 700);

  return () => clearTimeout(timer);
}, [serviceId, smartcard]);

  /* ================= CHECKOUT ================= */
  const handleCheckout = () => {
    if (!selectedVar || !verifiedName || !phone) return;

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
      <div className="max-w-md mx-auto px-4 py-6 space-y-4">

        {/* FORM */}
        {stage === "idle" && (
          <div className="bg-white dark:bg-gray-900 border rounded-lg p-6 space-y-4 shadow">

            <h2 className="text-xl font-bold">Cable Subscription</h2>

            <input
              value={smartcard}
              onChange={e => setSmartcard(e.target.value)}
              placeholder="Smartcard Number"
              className="w-full p-3 border rounded"
            />

            <select
              value={serviceId}
              onChange={e => setServiceId(e.target.value)}
              className="w-full p-3 border rounded"
            >
              <option value="">Select Provider</option>
              {SERVICES.map(s => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>

            {verifying && (
              <p className="text-sm text-gray-500">Verifying smartcard…</p>
            )}

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
                    variations.find(v => v.variation_code === e.target.value) ||
                      null
                  )
                }
                className="w-full p-3 border rounded"
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
              placeholder="Phone Number"
              className="w-full p-3 border rounded"
            />

            <button
              onClick={handleCheckout}
              disabled={!verifiedName || !selectedVar || !phone}
              className="w-full bg-yellow-500 text-white py-3 rounded font-semibold disabled:opacity-60"
            >
              Pay
            </button>
          </div>
        )}

        {/* PROCESSING */}
        {stage === "processing" && (
          <div className="bg-white border rounded-lg p-6 text-center shadow">
            Processing your cable subscription…
          </div>
        )}

        {/* SUCCESS */}
        {stage === "success" && (
          <div className="bg-green-100 border p-6 rounded text-center space-y-2">
            <h2 className="text-xl font-bold">Success 🎉</h2>
            {reference && (
              <p className="text-xs break-all">
                <b>Reference:</b> {reference}
              </p>
            )}
          </div>
        )}

        {/* ERROR */}
        {stage === "error" && (
          <div className="bg-red-100 border p-6 rounded text-center">
            <p className="text-sm">{errorMessage}</p>
          </div>
        )}

      </div>
    </BannersWrapper>
  );
}
