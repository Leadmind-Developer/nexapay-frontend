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

  const [stage, setStage] = useState<Stage>("form");

  const {
    checkout,
    loading,
    error,
    success,
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
      .catch(() => {
        setStage("error");
      });
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
      setStage("error");
      return;
    }

    setStage("processing");

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

  /* ================= SUCCESS ================= */
  useEffect(() => {
    if (success) {
      setStage("success");
    }
  }, [success]);

  /* ================= UI ================= */
  return (
    <ResponsiveLandingWrapper>
      <BannersWrapper page="insurance">
        <div className="max-w-lg mx-auto px-4">

          {/* ================= FORM ================= */}
          {stage === "form" && (
            <div className="bg-white dark:bg-gray-900 p-6 rounded-lg space-y-4 shadow">
              <h2 className="text-xl font-bold">Insurance</h2>

              <select
                value={variationCode}
                onChange={e => setVariationCode(e.target.value)}
                className="w-full p-3 border rounded dark:bg-gray-800"
              >
                <option value="">Select Plan</option>
                {variations.map(v => (
                  <option key={v.variation_code} value={v.variation_code}>
                    {v.name} — ₦{v.amount}
                  </option>
                ))}
              </select>

              <input
                value={billersCode}
                onChange={e => setBillersCode(e.target.value)}
                placeholder="Customer number"
                className="w-full p-3 border rounded dark:bg-gray-800"
              />

              <input
                value={insuredName}
                onChange={e => setInsuredName(e.target.value)}
                placeholder="Insured name"
                className="w-full p-3 border rounded dark:bg-gray-800"
              />

              <input value={vehicleMake} onChange={e => setVehicleMake(e.target.value)} placeholder="Vehicle make" className="w-full p-3 border rounded" />
              <input value={vehicleModel} onChange={e => setVehicleModel(e.target.value)} placeholder="Vehicle model" className="w-full p-3 border rounded" />
              <input value={vehicleColor} onChange={e => setVehicleColor(e.target.value)} placeholder="Vehicle color" className="w-full p-3 border rounded" />
              <input value={engineCapacity} onChange={e => setEngineCapacity(e.target.value)} placeholder="Engine capacity" className="w-full p-3 border rounded" />
              <input value={chasisNumber} onChange={e => setChasisNumber(e.target.value)} placeholder="Chasis number" className="w-full p-3 border rounded" />
              <input value={plateNumber} onChange={e => setPlateNumber(e.target.value)} placeholder="Plate number" className="w-full p-3 border rounded" />
              <input value={yearOfMake} onChange={e => setYearOfMake(e.target.value)} placeholder="Year of make" className="w-full p-3 border rounded" />
              <input value={state} onChange={e => setState(e.target.value)} placeholder="State" className="w-full p-3 border rounded" />
              <input value={lga} onChange={e => setLGA(e.target.value)} placeholder="LGA" className="w-full p-3 border rounded" />
              <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email (optional)" className="w-full p-3 border rounded" />

              <p className="text-sm text-gray-600">
                Amount: <b>₦{amount}</b>
              </p>

              <button
                onClick={handleCheckout}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded font-semibold disabled:opacity-60"
              >
                Continue
              </button>
            </div>
          )}

          {/* ================= PROCESSING ================= */}
          {stage === "processing" && (
            <div className="bg-white dark:bg-gray-900 p-6 rounded text-center">
              Processing transaction…
            </div>
          )}

          {/* ================= SUCCESS ================= */}
          {stage === "success" && (
            <div className="bg-green-100 dark:bg-green-900 p-6 rounded text-center">
              <h2 className="text-xl font-bold text-green-700 dark:text-green-300">
                Insurance Purchased 🎉
              </h2>
              <p className="mt-2 text-sm">
                Reference: <b>{reference}</b>
              </p>
              <p className="mt-3 text-sm">
                Redirecting to transactions…
              </p>
            </div>
          )}

          {/* ================= ERROR ================= */}
          {stage === "error" && (
            <div className="bg-red-100 dark:bg-red-900 p-6 rounded text-center">
              <p className="text-red-700 dark:text-red-300">
                {error || "Something went wrong. Please try again later."}
              </p>
              <button
                onClick={() => {
                  reset();
                  setStage("form");
                }}
                className="mt-4 w-full bg-gray-800 text-white py-3 rounded"
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
