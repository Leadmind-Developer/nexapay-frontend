"use client";

import { useEffect, useMemo, useState } from "react";
import api from "@/lib/api";
import BannersWrapper from "@/components/BannersWrapper";

/* ================= TYPES ================= */
interface Variation {
  name: string;
  variation_code: string;
  amount: number;
  requiredFields?: string[];
}

type Stage = "form" | "processing" | "success" | "error";

/* ================= PAGE ================= */
export default function InsurancePage() {
  const serviceID = "ui-insure";

  const [variations, setVariations] = useState<Variation[]>([]);
  const [variationCode, setVariationCode] = useState("");
  const [billersCode, setBillersCode] = useState("");

  const [form, setForm] = useState<Record<string, string>>({});

  const [stage, setStage] = useState<Stage>("form");
  const [errorMessage, setErrorMessage] = useState("");
  const [reference, setReference] = useState<string | null>(null);

  /* ================= FETCH VARIATIONS ================= */
  useEffect(() => {
  api
    .get(`/vtpass/insurance/variations?serviceID=${serviceID}`)
    .then(res => {
      console.log("Insurance variations raw:", res.data);
      const data =
        res.data?.content?.variations ||
        res.data?.variations ||
        [];
      setVariations(data);
    })
    .catch(() => {
      setVariations([]);
    });
}, [serviceID]);

  /* ================= DERIVED ================= */
  const selectedVariation = useMemo(
    () => variations.find(v => v.variation_code === variationCode),
    [variations, variationCode]
  );

  const amount = selectedVariation?.amount || 0;
  const requiredFields = selectedVariation?.requiredFields || [];

  /* ================= VALIDATION ================= */
  function validate(): string | null {
    if (!variationCode) return "Please select an insurance plan";
    if (!billersCode) return "Customer number is required";

    for (const field of requiredFields) {
      if (!form[field]) {
        return `${field.replace(/_/g, " ")} is required`;
      }
    }

    if (amount <= 0) return "Invalid amount";

    return null;
  }

  /* ================= CHECKOUT ================= */
  async function handleCheckout() {
    const validationError = validate();
    if (validationError) {
      setErrorMessage(validationError);
      setStage("error");
      return;
    }

    setStage("processing");
    setErrorMessage("");

    try {
      const res = await api.post(
        "/vtpass/insurance/checkout",
        {
          serviceID,
          variation_code: variationCode,
          billersCode,
          amount,
          ...form,
        },
        { withCredentials: true }
      );

      if (res.data?.success) {
        setReference(res.data.requestId || res.data.reference || null);
        setStage("success");

        setTimeout(() => {
          window.location.href = "/transactions";
        }, 2500);
        return;
      }

      if (res.data?.status === "paystack" && res.data.authorization_url) {
        window.location.href = res.data.authorization_url;
        return;
      }

      setErrorMessage(res.data?.error || res.data?.message || "Transaction failed");
      setStage("error");
    } catch (err: any) {
      console.error("Insurance checkout error:", err);
      setErrorMessage(
        err?.response?.data?.error ||
          err?.response?.data?.message ||
          "Checkout failed"
      );
      setStage("error");
    }
  }

  /* ================= FIELD RENDER ================= */
  const renderField = (field: string) => (
    <input
      key={field}
      value={form[field] || ""}
      onChange={e =>
        setForm(prev => ({ ...prev, [field]: e.target.value }))
      }
      placeholder={field.replace(/_/g, " ")}
      className="w-full p-3 border rounded"
    />
  );

  /* ================= UI ================= */
  return (
    <BannersWrapper page="insurance">
      <div className="max-w-lg mx-auto px-4 py-10">
        {stage === "form" && (
          <div className="bg-white dark:bg-gray-900 p-6 rounded-lg space-y-4 shadow">
            <h2 className="text-xl font-bold">Insurance</h2>

            <select
              value={variationCode}
              onChange={e => setVariationCode(e.target.value)}
              className="w-full p-3 border rounded"
            >
              <option value="">Select Plan</option>
              {variations.map(v => (
                <option key={v.variation_code} value={v.variation_code}>
                  {v.name} — ₦{Number(v.amount).toLocaleString()}
                </option>
              ))}
            </select>

            <input
              value={billersCode}
              onChange={e => setBillersCode(e.target.value)}
              placeholder="Customer number"
              className="w-full p-3 border rounded"
            />

            {requiredFields.map(renderField)}

            <p className="text-sm font-medium">
              Amount: ₦{amount.toLocaleString()}
            </p>

            <button
              onClick={handleCheckout}
              className="w-full bg-blue-600 text-white py-3 rounded"
            >
              Continue
            </button>
          </div>
        )}

        {stage === "processing" && (
          <div className="bg-white p-6 rounded text-center shadow">
            Processing transaction…
          </div>
        )}

        {stage === "success" && (
          <div className="bg-green-100 p-6 rounded text-center">
            <h2 className="font-bold">Insurance Purchased 🎉</h2>
            {reference && (
              <p className="text-sm mt-2">
                Reference: <b>{reference}</b>
              </p>
            )}
          </div>
        )}

        {stage === "error" && (
          <div className="bg-red-100 p-6 rounded text-center">
            <p className="text-red-700">
              {errorMessage || "Something went wrong"}
            </p>
            <button
              onClick={() => setStage("form")}
              className="mt-4 w-full bg-gray-800 text-white py-2 rounded"
            >
              Back
            </button>
          </div>
        )}
      </div>
    </BannersWrapper>
  );
}
