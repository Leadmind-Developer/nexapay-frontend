"use client";

import React, { useEffect, useState } from "react";
import api from "@/lib/api";
import BannersWrapper from "@/components/BannersWrapper";
import { useCheckout } from "@/hooks/useCheckout";

/* ================= TYPES ================= */
type Country = { code: string; name: string };
type ProductType = { id: string; name: string };
type Operator = {
  id: string;
  name: string;
  minLength?: number;
  maxLength?: number;
};
type Variation = {
  variation_code: string;
  name: string;
  amount: number;
};

type Stage = "form" | "review";

/* ================= PAGE ================= */
export default function IntAirtimePage() {
  const [stage, setStage] = useState<Stage>("form");

  const [countries, setCountries] = useState<Country[]>([]);
  const [productTypes, setProductTypes] = useState<ProductType[]>([]);
  const [operators, setOperators] = useState<Operator[]>([]);
  const [variations, setVariations] = useState<Variation[]>([]);

  const [country, setCountry] = useState("");
  const [productType, setProductType] = useState("");
  const [operator, setOperator] = useState("");
  const [variation, setVariation] = useState("");

  const [billersCode, setBillersCode] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  const [amount, setAmount] = useState(0);
  const [minLen, setMinLen] = useState(0);
  const [maxLen, setMaxLen] = useState(20);

  const {
    stage: checkoutStage,
    errorMessage,
    reference,
    checkout,
  } = useCheckout();

  /* ================= LOOKUPS ================= */
  useEffect(() => {
    api.get("/vtpass/intl/countries")
      .then(res => setCountries(res.data?.data || []))
      .catch(() => setCountries([]));
  }, []);

  useEffect(() => {
    if (!country) return setProductTypes([]);
    api.get(`/vtpass/intl/product-types/${country}`)
      .then(res => setProductTypes(res.data?.data || []))
      .catch(() => setProductTypes([]));
  }, [country]);

  useEffect(() => {
    if (!country || !productType) return setOperators([]);
    api.get(`/vtpass/intl/operators`, {
      params: { code: country, product_type_id: productType },
    })
      .then(res => setOperators(res.data?.data || []))
      .catch(() => setOperators([]));
  }, [country, productType]);

  useEffect(() => {
    if (!operator || !productType) return setVariations([]);
    api.get(`/vtpass/intl/variations`, {
      params: { operator_id: operator, product_type_id: productType },
    })
      .then(res => setVariations(res.data?.data || []))
      .catch(() => setVariations([]));
  }, [operator, productType]);

  /* ================= DERIVED ================= */
  useEffect(() => {
    const v = variations.find(v => v.variation_code === variation);
    setAmount(v?.amount || 0);
  }, [variation, variations]);

  useEffect(() => {
    const op = operators.find(o => o.id === operator);
    setMinLen(op?.minLength || 0);
    setMaxLen(op?.maxLength || 20);
  }, [operator, operators]);

  /* ================= CHECKOUT ================= */
  const handleCheckout = () => {
    checkout({
      endpoint: "/vtpass/intl/checkout",
      payload: {
        country_code: country,
        product_type_id: productType,
        operator_id: operator,
        variation_code: variation,
        billersCode,
        amount,
        phone,
        email,
      },
    });
  };

  /* ================= UI ================= */
  return (    
      <BannersWrapper page="int-airtime">
        <div className="max-w-md mx-auto px-4 space-y-4 text-gray-900 dark:text-gray-100">

          {/* ===== FORM ===== */}
          {checkoutStage === "idle" && stage === "form" && (
            <div className="bg-white dark:bg-gray-900 border dark:border-gray-800 rounded-lg p-6 space-y-4 shadow">
              <h2 className="text-xl font-bold">International Airtime</h2>

              <select
                className="w-full p-3 border rounded dark:bg-gray-900 dark:border-gray-700"
                value={country}
                onChange={e => {
                  setCountry(e.target.value);
                  setProductType("");
                  setOperator("");
                  setVariation("");
                }}
              >
                <option value="">Select Country</option>
                {countries.map(c => (
                  <option key={c.code} value={c.code}>{c.name}</option>
                ))}
              </select>

              <select
                className="w-full p-3 border rounded dark:bg-gray-900 dark:border-gray-700"
                value={productType}
                onChange={e => {
                  setProductType(e.target.value);
                  setOperator("");
                  setVariation("");
                }}
              >
                <option value="">Select Product</option>
                {productTypes.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>

              <select
                className="w-full p-3 border rounded dark:bg-gray-900 dark:border-gray-700"
                value={operator}
                onChange={e => {
                  setOperator(e.target.value);
                  setVariation("");
                }}
              >
                <option value="">Select Operator</option>
                {operators.map(o => (
                  <option key={o.id} value={o.id}>{o.name}</option>
                ))}
              </select>

              <select
                className="w-full p-3 border rounded dark:bg-gray-900 dark:border-gray-700"
                value={variation}
                onChange={e => setVariation(e.target.value)}
              >
                <option value="">Select Amount</option>
                {variations.map(v => (
                  <option key={v.variation_code} value={v.variation_code}>
                    {v.name} — ₦{v.amount}
                  </option>
                ))}
              </select>

              <input
                value={billersCode}
                onChange={e => setBillersCode(e.target.value)}
                placeholder={`Recipient number ${minLen ? `(min ${minLen})` : ""}`}
                className="w-full p-3 border rounded dark:bg-gray-900 dark:border-gray-700"
              />

              <input
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="Phone (optional)"
                className="w-full p-3 border rounded dark:bg-gray-900 dark:border-gray-700"
              />

              <input
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Email (optional)"
                className="w-full p-3 border rounded dark:bg-gray-900 dark:border-gray-700"
              />

              <button
                disabled={!amount || !billersCode}
                onClick={() => setStage("review")}
                className="w-full bg-yellow-500 text-white py-3 rounded font-semibold disabled:opacity-60"
              >
                Review
              </button>
            </div>
          )}

          {/* ===== REVIEW ===== */}
          {checkoutStage === "idle" && stage === "review" && (
            <div className="bg-white dark:bg-gray-900 border dark:border-gray-800 rounded-lg p-6 space-y-3 shadow">
              <h2 className="text-xl font-bold">Review</h2>
              <p><b>Country:</b> {country}</p>
              <p><b>Amount:</b> ₦{amount}</p>

              <div className="flex gap-3">
                <button
                  onClick={() => setStage("form")}
                  className="flex-1 bg-gray-200 dark:bg-gray-700 py-3 rounded"
                >
                  Back
                </button>
                <button
                  onClick={handleCheckout}
                  className="flex-1 bg-yellow-500 text-white py-3 rounded"
                >
                  Pay
                </button>
              </div>
            </div>
          )}

          {/* ===== PROCESSING ===== */}
          {checkoutStage === "processing" && (
            <div className="bg-white dark:bg-gray-900 border dark:border-gray-800 p-6 rounded text-center shadow">
              Processing transaction…
            </div>
          )}

          {/* ===== SUCCESS ===== */}
          {checkoutStage === "success" && (
            <div className="bg-green-100 dark:bg-green-900 border dark:border-green-800 p-6 rounded text-center space-y-2">
              <h2 className="text-xl font-bold">Airtime Sent 🎉</h2>

              {reference && (
                <p className="text-xs break-all">
                  <b>Reference:</b> {reference}
                </p>
              )}

              <p className="text-sm opacity-80">
                You’ll find full details in Transactions.
              </p>
            </div>
          )}

          {/* ===== ERROR ===== */}
          {checkoutStage === "error" && (
            <div className="bg-red-100 dark:bg-red-900 border dark:border-red-800 p-6 rounded text-center space-y-3">
              <h2 className="text-lg font-bold">Transaction Failed</h2>
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
