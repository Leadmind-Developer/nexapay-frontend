"use client";

import React, { useEffect, useState } from "react";
import api from "@/lib/api";
import ResponsiveLandingWrapper from "@/components/ResponsiveLandingWrapper";
import BannersWrapper from "@/components/BannersWrapper";

/* ================= TYPES ================= */
interface Country {
  code: string;
  name: string;
}

interface ProductType {
  id: string;
  name: string;
}

interface Operator {
  id: string;
  name: string;
  minLength?: number;
  maxLength?: number;
}

interface Variation {
  variation_code: string;
  name: string;
  amount: number;
}

type Stage = "form" | "review" | "paying" | "success" | "error";

/* ================= PAGE ================= */
export default function IntAirtimePage() {
  const [stage, setStage] = useState<Stage>("form");

  const [countries, setCountries] = useState<Country[]>([]);
  const [productTypes, setProductTypes] = useState<ProductType[]>([]);
  const [operators, setOperators] = useState<Operator[]>([]);
  const [variations, setVariations] = useState<Variation[]>([]);

  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedProductType, setSelectedProductType] = useState("");
  const [selectedOperator, setSelectedOperator] = useState("");
  const [selectedVariation, setSelectedVariation] = useState("");

  const [billersCode, setBillersCode] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  const [selectedAmount, setSelectedAmount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [receipt, setReceipt] = useState<any>(null);

  const [minLen, setMinLen] = useState(0);
  const [maxLen, setMaxLen] = useState(20);

  /* ================= FETCH FLOW ================= */
  useEffect(() => {
    api.get("/vtpass/intl/countries")
      .then(res => setCountries(res.data.data || []))
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (!selectedCountry) return setProductTypes([]);
    api.get(`/vtpass/intl/product-types/${selectedCountry}`)
      .then(res => setProductTypes(res.data.data || []))
      .catch(console.error);
  }, [selectedCountry]);

  useEffect(() => {
    if (!selectedCountry || !selectedProductType) return setOperators([]);
    api.get(`/vtpass/intl/operators?code=${selectedCountry}&product_type_id=${selectedProductType}`)
      .then(res => setOperators(res.data.data || []))
      .catch(console.error);
  }, [selectedCountry, selectedProductType]);

  useEffect(() => {
    if (!selectedOperator || !selectedProductType) return setVariations([]);
    api.get(`/vtpass/intl/variations?operator_id=${selectedOperator}&product_type_id=${selectedProductType}`)
      .then(res => setVariations(res.data.data || []))
      .catch(console.error);
  }, [selectedOperator, selectedProductType]);

  useEffect(() => {
    const v = variations.find(x => x.variation_code === selectedVariation);
    setSelectedAmount(v ? v.amount : 0);
  }, [selectedVariation, variations]);

  useEffect(() => {
    const op = operators.find(o => o.id === selectedOperator);
    setMinLen(op?.minLength || 0);
    setMaxLen(op?.maxLength || 20);
  }, [selectedOperator, operators]);

  /* ================= PAYMENT ================= */
  const startPayment = async () => {
    if (!selectedVariation || !billersCode) return;

    try {
      setStage("paying");
      setLoading(true);

      const reference = `INT-${Date.now()}`;

      const init = await api.post("/paystack/initialize", {
        email: email || "guest@nexa-pay.app",
        amount: selectedAmount * 100,
        reference,
        metadata: {
          purpose: "intl_airtime",
          country: selectedCountry,
          productType: selectedProductType,
          operator: selectedOperator,
          variation: selectedVariation,
          billersCode,
          phone,
        },
        callback_url: `${window.location.origin}/IntAirtime?ref=${reference}`,
      });

      window.location.href = init.data.data.authorization_url;
    } catch {
      setStage("error");
      setLoading(false);
    }
  };

  const verifyAndPurchase = async (reference: string) => {
    try {
      const verify = await api.get(`/paystack/verify/${reference}`);
      if (verify.data.status !== "success") throw new Error();

      const purchase = await api.post("/vtpass/intl/purchase", {
        billersCode,
        variation_code: selectedVariation,
        amount: selectedAmount,
        phone,
        operator_id: selectedOperator,
        country_code: selectedCountry,
        product_type_id: selectedProductType,
        email,
      });

      setReceipt({ reference, amount: selectedAmount, data: purchase.data });
      setStage("success");
    } catch {
      setStage("error");
    }
  };

  useEffect(() => {
    const ref = new URL(window.location.href).searchParams.get("ref");
    if (ref) verifyAndPurchase(ref);
  }, []);

  /* ================= WIZARD ================= */
  const steps = ["Details", "Review", "Payment", "Complete"];
  const stageIndex = ["form","review","paying","success","error"].indexOf(stage);

  return (
    <ResponsiveLandingWrapper>
      <BannersWrapper page="int-airtime">
        <div className="max-w-md mx-auto px-4">

          {/* ===== WIZARD HEADER (SHARED) ===== */}
          <div className="flex items-center justify-between mb-8">
            {steps.map((_, idx) => {
              const active = idx <= stageIndex;
              return (
                <div key={idx} className="flex-1 flex items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center border-2
                    ${active
                      ? "bg-yellow-500 border-yellow-500 text-white"
                      : "bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 text-gray-500"}`}
                  >
                    {idx + 1}
                  </div>
                  {idx < steps.length - 1 && (
                    <div className={`flex-1 h-1 -ml-1 ${idx < stageIndex ? "bg-yellow-500" : "bg-gray-300 dark:bg-gray-700"}`} />
                  )}
                </div>
              );
            })}
          </div>

          {/* ================= FORM ================= */}
          {stage === "form" && (
            <div className="bg-white dark:bg-gray-900 shadow-md rounded-lg p-6 space-y-4">
              <h2 className="text-xl font-bold">International Airtime</h2>

              <select className="w-full p-3 border rounded dark:bg-gray-800 dark:border-gray-700"
                value={selectedCountry}
                onChange={e => {
                  setSelectedCountry(e.target.value);
                  setSelectedProductType("");
                  setSelectedOperator("");
                  setSelectedVariation("");
                }}>
                <option value="">Select Country</option>
                {countries.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}
              </select>

              <select className="w-full p-3 border rounded dark:bg-gray-800 dark:border-gray-700"
                value={selectedProductType}
                onChange={e => {
                  setSelectedProductType(e.target.value);
                  setSelectedOperator("");
                  setSelectedVariation("");
                }}>
                <option value="">Select Product</option>
                {productTypes.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>

              <select className="w-full p-3 border rounded dark:bg-gray-800 dark:border-gray-700"
                value={selectedOperator}
                onChange={e => {
                  setSelectedOperator(e.target.value);
                  setSelectedVariation("");
                }}>
                <option value="">Select Operator</option>
                {operators.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
              </select>

              <select className="w-full p-3 border rounded dark:bg-gray-800 dark:border-gray-700"
                value={selectedVariation}
                onChange={e => setSelectedVariation(e.target.value)}>
                <option value="">Select Variation</option>
                {variations.map(v => (
                  <option key={v.variation_code} value={v.variation_code}>
                    {v.name} — ₦{v.amount}
                  </option>
                ))}
              </select>

              <input
                value={billersCode}
                onChange={e => setBillersCode(e.target.value)}
                placeholder={`Customer number ${minLen ? `(min ${minLen})` : ""}`}
                className="w-full p-3 border rounded dark:bg-gray-800 dark:border-gray-700"
              />

              <input value={phone} onChange={e => setPhone(e.target.value)}
                placeholder="Phone (optional)"
                className="w-full p-3 border rounded dark:bg-gray-800 dark:border-gray-700" />

              <input value={email} onChange={e => setEmail(e.target.value)}
                placeholder="Email (optional)"
                className="w-full p-3 border rounded dark:bg-gray-800 dark:border-gray-700" />

              <button
                onClick={() => setStage("review")}
                disabled={!selectedAmount || !billersCode}
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-white py-3 rounded font-semibold disabled:opacity-60"
              >
                Review
              </button>
            </div>
          )}

          {/* ================= REVIEW ================= */}
          {stage === "review" && (
            <div className="bg-white dark:bg-gray-900 shadow-md rounded-lg p-6 space-y-3">
              <h2 className="text-xl font-bold">Review</h2>
              <p><b>Country:</b> {selectedCountry}</p>
              <p><b>Amount:</b> ₦{selectedAmount}</p>

              <div className="flex gap-3">
                <button onClick={() => setStage("form")}
                  className="flex-1 bg-gray-200 dark:bg-gray-700 py-3 rounded">
                  Back
                </button>
                <button onClick={startPayment}
                  className="flex-1 bg-yellow-500 text-white py-3 rounded">
                  Pay
                </button>
              </div>
            </div>
          )}

          {/* ================= PAYING / RESULT ================= */}
          {stage === "paying" && (
            <div className="bg-white dark:bg-gray-900 p-6 rounded text-center">
              Processing payment…
            </div>
          )}

          {stage === "success" && (
            <div className="bg-green-100 dark:bg-green-900 p-6 rounded text-center">
              <h2 className="text-xl font-bold">Purchase Successful 🎉</h2>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 bg-yellow-500 text-white py-3 w-full rounded"
              >
                Buy Again
              </button>
            </div>
          )}

          {stage === "error" && (
            <div className="bg-red-100 dark:bg-red-900 p-6 rounded text-center">
              Transaction failed
              <button
                onClick={() => setStage("form")}
                className="mt-4 bg-yellow-500 text-white py-3 w-full rounded"
              >
                Retry
              </button>
            </div>
          )}

        </div>
      </BannersWrapper>
    </ResponsiveLandingWrapper>
  );
}
