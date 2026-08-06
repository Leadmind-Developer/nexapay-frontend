"use client";

import React, { useEffect, useState } from "react";
import api from "@/lib/api";
import BannersWrapper from "@/components/BannersWrapper";
import { useCheckout } from "@/hooks/useCheckout";

/* ================= TYPES ================= */

type Country = {
  code: string;
  name: string;
};

type ProductType = {
  product_type_id: number;
  name: string;
};

type Operator = {
  operator_id: string;
  name: string;
  operator_image?: string;
};

type Variation = {
  variation_code: string;
  name: string;
  variation_amount: string;
  fixedPrice: string;
};

type Stage = "form" | "review";

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

  const {
    stage: checkoutStage,
    errorMessage,
    reference,
    checkout,
  } = useCheckout();

  /* ================= Countries ================= */

  useEffect(() => {
    api
      .get("/vtpass/international/countries")
      .then((res) => setCountries(res.data?.data ?? []))
      .catch(() => setCountries([]));
  }, []);

  /* ================= Product Types ================= */

  useEffect(() => {
    if (!country) {
      setProductTypes([]);
      setOperators([]);
      setVariations([]);
      return;
    }

    api
      .get(`/vtpass/international/product-types/${country}`)
      .then((res) => setProductTypes(res.data?.data ?? []))
      .catch(() => setProductTypes([]));
  }, [country]);

  /* ================= Operators ================= */

  useEffect(() => {
    if (!country || !productType) {
      setOperators([]);
      setVariations([]);
      return;
    }

    api
      .get("/vtpass/international/operators", {
        params: {
          code: country,
          product_type_id: productType,
        },
      })
      .then((res) => setOperators(res.data?.data ?? []))
      .catch(() => setOperators([]));
  }, [country, productType]);

  /* ================= Variations ================= */

  useEffect(() => {
    if (!operator || !productType) {
      setVariations([]);
      return;
    }

    api
      .get("/vtpass/international/variations", {
        params: {
          operator_id: operator,
          product_type_id: productType,
        },
      })
      .then((res) => setVariations(res.data?.data ?? []))
      .catch(() => setVariations([]));
  }, [operator, productType]);

  /* ================= Selected Amount ================= */

  useEffect(() => {
    const selected = variations.find(
      (v) => v.variation_code === variation
    );

    setAmount(Number(selected?.variation_amount ?? 0));
  }, [variation, variations]);

  /* ================= Checkout ================= */

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

  return (
    <BannersWrapper page="int-airtime">
      <div className="max-w-md mx-auto px-4 space-y-4 text-gray-900 dark:text-gray-100">

        {checkoutStage === "idle" && stage === "form" && (
          <div className="bg-white dark:bg-gray-900 border dark:border-gray-800 rounded-lg p-6 shadow space-y-4">

            <h2 className="text-xl font-bold">
              International Airtime
            </h2>

            <select
              className="w-full p-3 border rounded dark:bg-gray-900 dark:border-gray-700"
              value={country}
              onChange={(e) => {
                setCountry(e.target.value);

                setProductType("");
                setOperator("");
                setVariation("");

                setOperators([]);
                setVariations([]);
              }}
            >
              <option value="">Select Country</option>

              {countries.map((country) => (
                <option
                  key={country.code}
                  value={country.code}
                >
                  {country.name}
                </option>
              ))}
            </select>

            <select
              className="w-full p-3 border rounded dark:bg-gray-900 dark:border-gray-700"
              value={productType}
              onChange={(e) => {
                setProductType(e.target.value);

                setOperator("");
                setVariation("");

                setVariations([]);
              }}
            >
              <option value="">Select Product</option>

              {productTypes.map((product) => (
                <option
                  key={product.product_type_id}
                  value={product.product_type_id}
                >
                  {product.name}
                </option>
              ))}
            </select>

            <select
              className="w-full p-3 border rounded dark:bg-gray-900 dark:border-gray-700"
              value={operator}
              onChange={(e) => {
                setOperator(e.target.value);
                setVariation("");
              }}
            >
              <option value="">Select Operator</option>

              {operators.map((operator) => (
                <option
                  key={operator.operator_id}
                  value={operator.operator_id}
                >
                  {operator.name}
                </option>
              ))}
            </select>

            <select
              className="w-full p-3 border rounded dark:bg-gray-900 dark:border-gray-700"
              value={variation}
              onChange={(e) => setVariation(e.target.value)}
            >
              <option value="">Select Amount</option>

              {variations.map((variation) => (
                <option
                  key={variation.variation_code}
                  value={variation.variation_code}
                >
                  {variation.name} — ₦{variation.variation_amount}
                </option>
              ))}
            </select>

            <input
              className="w-full p-3 border rounded dark:bg-gray-900 dark:border-gray-700"
              value={billersCode}
              onChange={(e) => setBillersCode(e.target.value)}
              placeholder="Recipient number"
            />

            <input
              className="w-full p-3 border rounded dark:bg-gray-900 dark:border-gray-700"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Phone (optional)"
            />

            <input
              className="w-full p-3 border rounded dark:bg-gray-900 dark:border-gray-700"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email (optional)"
            />

            <button
              disabled={
                !country ||
                !productType ||
                !operator ||
                !variation ||
                !billersCode
              }
              onClick={() => setStage("review")}
              className="w-full bg-yellow-500 text-white py-3 rounded font-semibold disabled:opacity-60"
            >
              Review
            </button>
          </div>
        )}

        {/* Keep your existing Review / Processing / Success / Error UI below unchanged */}

      </div>
    </BannersWrapper>
  );
}
