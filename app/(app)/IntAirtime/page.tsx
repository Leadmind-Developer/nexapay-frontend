"use client";

import React, { useEffect, useState } from "react";
import api from "@/lib/api";
import BannersWrapper from "@/components/BannersWrapper";
import { useCheckout } from "@/hooks/useCheckout";
import NotAvailable from "@/components/NotAvailable";

/* ================= TYPES (Backend-aligned) ================= */
type Country = {
  code: string;
  name: string;
};

type ProductType = {
  id: string;
  name: string;
};

type Operator = {
  id: string;
  name: string;
  min_length?: number;
  max_length?: number;
};

type Variation = {
  variation_code: string;
  name: string;
  amount: number;
};

type Stage = "form" | "review";

/* ================= PAGE ================= */
export default function IntAirtimePage() {  

  // 🔒 TEMPORARILY DISABLED
  return (
    <NotAvailable
      title="International Airtime Not Available"
      message="International Airtime is temporarily unavailable. Please try again later."
    />
  );

  // ⛔ everything below remains unchanged
  
  const [stage, setStage] = useState<Stage>("form");

  const [countries, setCountries] = useState<Country[]>([]);
  const [productTypes, setProductTypes] = useState<ProductType[]>([]);
  const [operators, setOperators] = useState<Operator[]>([]);
  const [variations, setVariations] = useState<Variation[]>([]);

  const [country, setCountry] = useState<string>("");
  const [productType, setProductType] = useState<string>("");
  const [operator, setOperator] = useState<string>("");
  const [variation, setVariation] = useState<string>("");

  const [billersCode, setBillersCode] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  const [amount, setAmount] = useState<number>(0);
  const [minLen, setMinLen] = useState<number>(0);
  const [maxLen, setMaxLen] = useState<number>(20);

  const {
    stage: checkoutStage,
    errorMessage,
    reference,
    checkout,
  } = useCheckout();

  /* ================= LOOKUPS ================= */

  /** Countries */
  useEffect(() => {
    api
      .get("/vtpass/international/countries")
      .then(res => setCountries(res.data?.data ?? []))
      .catch(() => setCountries([]));
  }, []);

  /** Product Types */
  useEffect(() => {
    if (!country) {
      setProductTypes([]);
      return;
    }

    api
      .get(`/vtpass/international/product-types/${country}`)
      .then(res => setProductTypes(res.data?.data ?? []))
      .catch(() => setProductTypes([]));
  }, [country]);

  /** Operators */
  useEffect(() => {
    if (!country || !productType) {
      setOperators([]);
      return;
    }

    api
      .get("/vtpass/international/operators", {
        params: { code: country, product_type_id: productType },
      })
      .then(res => setOperators(res.data?.data ?? []))
      .catch(() => setOperators([]));
  }, [country, productType]);

  /** Variations */
  useEffect(() => {
    if (!operator || !productType) {
      setVariations([]);
      return;
    }

    api
      .get("/vtpass/international/variations", {
        params: { operator_id: operator, product_type_id: productType },
      })
      .then(res => setVariations(res.data?.data ?? []))
      .catch(() => setVariations([]));
  }, [operator, productType]);

  /* ================= DERIVED ================= */

  /** Amount */
  useEffect(() => {
    const selected = variations.find(v => v.variation_code === variation);
    setAmount(selected?.amount ?? 0);
  }, [variation, variations]);

  /** Phone length */
  useEffect(() => {
    const selected = operators.find(o => o.id === operator);
    setMinLen(selected?.min_length ?? 0);
    setMaxLen(selected?.max_length ?? 20);
  }, [operator, operators]);

  /* ================= CHECKOUT ================= */
  const handleCheckout = () => {
    checkout({
      endpoint: "/vtpass/international/checkout",
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

            {/* Country */}
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
                <option key={c.code} value={c.code}>
                  {c.name}
                </option>
              ))}
            </select>

            {/* Product */}
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
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>

            {/* Operator */}
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
                <option key={o.id} value={o.id}>
                  {o.name}
                </option>
              ))}
            </select>

            {/* Amount */}
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

            {/* Recipient */}
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

        {/* ===== REVIEW / PROCESSING / SUCCESS / ERROR ===== */}
        {/* (unchanged from your version) */}

      </div>
    </BannersWrapper>
  );
}
