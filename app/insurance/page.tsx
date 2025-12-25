"use client";

import { useEffect, useMemo, useState } from "react";
import api from "@/lib/api";
import ResponsiveLandingWrapper from "@/components/ResponsiveLandingWrapper";
import BannersWrapper from "@/components/BannersWrapper";
import { useCheckout } from "@/hooks/useCheckout";

/* ================= TYPES ================= */
interface Variation {
  name: string;
  variation_code: string;
  amount: number;
  requiredFields?: string[];
}

type Stage = "form" | "review" | "processing" | "success" | "error";

/* ================= PAGE ================= */
export default function InsurancePage() {
  const serviceID = "ui-insure";

  const [variations, setVariations] = useState<Variation[]>([]);
  const [variationCode, setVariationCode] = useState("");
  const [billersCode, setBillersCode] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  /* ---- Insurance Fields ---- */
  const [insuredName, setInsuredName] = useState("");
  const [engineCapacity, setEngineCapacity] = useState("");
  const [chasisNumber, setChasisNumber] = useState("");
  const [plateNumber, setPlateNumber] = useState("");
  const [vehicleMake, setVehicleMake] = useState("");
  const [vehicleModel, setVehicleModel] = useState("");
  const [vehicleColor, setVehicleColor] = useState("");
  const [yearOfMake, setYearOfMake] = useState("");
  const [state, setState] = useState("");
  const [lga, setLGA] = useState("");

  const {
    checkout,
    stage,
    errorMessage,
    reference,
    reset,
  } = useCheckout({
    service: "insurance",
    endpoint: "/vtpass/insurance/checkout",
    redirectOnSuccess: "/transactions",
  });

  /* ================= FETCH VARIATIONS ================= */
  useEffect(() => {
    api
      .get(`/vtpass/insurance/variations?serviceID=${serviceID}`)
      .then(res => setVariations(res.data || []))
      .catch(() => {});
  }, []);

  /* ================= DERIVED ================= */
  const selectedVariation = useMemo(
    () => variations.find(v => v.variation_code === variationCode),
    [variations, variationCode]
  );

  const amount = selectedVariation?.amount || 0;

  /* ================= VALIDATION ================= */
  function validate(): string | null {
    if (!variationCode) return "Please select an insurance plan";
    if (!billersCode) return "Customer number is required";

    const required = selectedVariation?.requiredFields || [];

    const map: Record<string, string> = {
      insuredName,
      engineCapacity,
      chasisNumber,
      plateNumber,
      vehicleMake,
      vehicleModel,
      vehicleColor,
      yearOfMake,
      state,
      lga,
      email,
    };

    for (const field of required) {
      if (!map[field]) {
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
      return;
    }

    await checkout({
      serviceID,
      variation_code: variationCode,
      billersCode,
      amount,
      phone,
      email,
      insuredName,
      engineCapacity,
      chasisNumber,
      plateNumber,
      vehicleMake,
      vehicleModel,
      vehicleColor,
      yearOfMake,
      state,
      lga,
    });
  }

  /* ================= UI ================= */
  return (
    <ResponsiveLandingWrapper>
      <BannersWrapper page="insurance">
        <div className="max-w-lg mx-auto px-4">

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
                    {v.name} — ₦{v.amount}
                  </option>
                ))}
              </select>

              <input value={billersCode} onChange={e => setBillersCode(e.target.value)} placeholder="Customer number" className="w-full p-3 border rounded" />
              <input value={insuredName} onChange={e => setInsuredName(e.target.value)} placeholder="Insured name" className="w-full p-3 border rounded" />

              <p className="text-sm">Amount: ₦{amount}</p>

              <button
                onClick={handleCheckout}
                disabled={stage === "processing"}
                className="w-full bg-blue-600 text-white py-3 rounded disabled:opacity-60"
              >
                Continue
              </button>
            </div>
          )}

          {stage === "processing" && (
            <div className="bg-white p-6 rounded text-center">
              Processing transaction…
            </div>
          )}

          {stage === "success" && (
            <div className="bg-green-100 p-6 rounded text-center">
              <h2 className="font-bold">Insurance Purchased 🎉</h2>
              <p className="text-sm mt-2">Reference: <b>{reference}</b></p>
            </div>
          )}

          {stage === "error" && (
            <div className="bg-red-100 p-6 rounded text-center">
              <p className="text-red-700">
                {errorMessage || "Something went wrong"}
              </p>
              <button
                onClick={() => reset()}
                className="mt-4 w-full bg-gray-800 text-white py-2 rounded"
              >
                Back
              </button>
            </div>
          )}

        </div>
      </BannersWrapper>
    </ResponsiveLandingWrapper>
  );
}
