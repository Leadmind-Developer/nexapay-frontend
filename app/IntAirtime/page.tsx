"use client";

import React, { useEffect, useState } from "react";
import api from "@/lib/api";

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
  minLength?: number; // for dynamic customer number validation
  maxLength?: number;
}

interface Variation {
  variation_code: string;
  name: string;
  amount: number;
}

export default function IntAirtimePage() {
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

  const [selectedAmount, setSelectedAmount] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [stage, setStage] = useState<"form" | "paying" | "success">("form");
  const [receipt, setReceipt] = useState<any>(null);

  const [customerMinLength, setCustomerMinLength] = useState<number>(0);
  const [customerMaxLength, setCustomerMaxLength] = useState<number>(20);

  // Fetch countries
  useEffect(() => {
    api.get("/vtpass/intl/countries")
      .then(res => setCountries(res.data.data || []))
      .catch(err => console.error(err));
  }, []);

  // Fetch product types when country changes
  useEffect(() => {
    if (!selectedCountry) return setProductTypes([]);
    api.get(`/vtpass/intl/product-types/${selectedCountry}`)
      .then(res => setProductTypes(res.data.data || []))
      .catch(err => console.error(err));
  }, [selectedCountry]);

  // Fetch operators when country & product type selected
  useEffect(() => {
    if (!selectedCountry || !selectedProductType) return setOperators([]);
    api.get(`/vtpass/intl/operators?code=${selectedCountry}&product_type_id=${selectedProductType}`)
      .then(res => {
        setOperators(res.data.data || []);
      })
      .catch(err => console.error(err));
  }, [selectedCountry, selectedProductType]);

  // Fetch variations when operator & product type selected
  useEffect(() => {
    if (!selectedOperator || !selectedProductType) return setVariations([]);
    api.get(`/vtpass/intl/variations?operator_id=${selectedOperator}&product_type_id=${selectedProductType}`)
      .then(res => setVariations(res.data.data || []))
      .catch(err => console.error(err));
  }, [selectedOperator, selectedProductType]);

  // Update selected amount
  useEffect(() => {
    const selected = variations.find(v => v.variation_code === selectedVariation);
    setSelectedAmount(selected ? selected.amount : 0);
  }, [selectedVariation, variations]);

  // Update customer number rules dynamically based on selected operator
  useEffect(() => {
    const op = operators.find(o => o.id === selectedOperator);
    setCustomerMinLength(op?.minLength || 0);
    setCustomerMaxLength(op?.maxLength || 20);
  }, [selectedOperator, operators]);

  // Validate customer number
  function validateCustomerNumber() {
    if (!billersCode) return "Customer number is required";
    if (billersCode.length < customerMinLength)
      return `Customer number must be at least ${customerMinLength} digits`;
    if (billersCode.length > customerMaxLength)
      return `Customer number must not exceed ${customerMaxLength} digits`;
    return null;
  }

  // Start Paystack payment
  async function startPayment() {
    const validationError = validateCustomerNumber();
    if (validationError) return alert(validationError);
    if (!selectedVariation) return alert("Select a variation");

    try {
      setLoading(true);
      const reference = `INT-${Date.now()}`;
      const initRes = await api.post("/paystack/initialize", {
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
        callback_url: `${window.location.origin}/intl-airtime?ref=${reference}`,
      });

      window.location.href = initRes.data.data.authorization_url;
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || "Payment init failed");
    } finally {
      setLoading(false);
    }
  }

  // Verify Paystack and purchase
  async function verifyAndPurchase(reference: string) {
    try {
      setStage("paying");
      const verify = await api.get(`/paystack/verify/${reference}`);
      if (verify.data.status !== "success") {
        alert("Payment not completed");
        setStage("form");
        return;
      }

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
    } catch (err: any) {
      console.error(err);
      alert("Purchase failed");
      setStage("form");
    }
  }

  // Handle redirect from Paystack
  useEffect(() => {
    const ref = new URL(window.location.href).searchParams.get("ref");
    if (ref) verifyAndPurchase(ref);
  }, []);

  return (
    <div className="max-w-lg mx-auto p-5">
      <h1 className="text-2xl font-bold mb-4">International Airtime</h1>

      {stage === "form" && (
        <>
          <label className="block mb-2 font-semibold">Country</label>
          <select
            value={selectedCountry}
            onChange={e => { setSelectedCountry(e.target.value); setSelectedProductType(""); setSelectedOperator(""); setSelectedVariation(""); }}
            className="w-full p-3 border rounded mb-4"
          >
            <option value="">Select Country</option>
            {countries.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}
          </select>

          <label className="block mb-2 font-semibold">Product Type</label>
          <select
            value={selectedProductType}
            onChange={e => { setSelectedProductType(e.target.value); setSelectedOperator(""); setSelectedVariation(""); }}
            className="w-full p-3 border rounded mb-4"
          >
            <option value="">Select Product</option>
            {productTypes.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>

          <label className="block mb-2 font-semibold">Operator</label>
          <select
            value={selectedOperator}
            onChange={e => { setSelectedOperator(e.target.value); setSelectedVariation(""); }}
            className="w-full p-3 border rounded mb-4"
          >
            <option value="">Select Operator</option>
            {operators.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
          </select>

          <label className="block mb-2 font-semibold">Variation</label>
          <select
            value={selectedVariation}
            onChange={e => setSelectedVariation(e.target.value)}
            className="w-full p-3 border rounded mb-4"
          >
            <option value="">Select Variation</option>
            {variations.map(v => <option key={v.variation_code} value={v.variation_code}>{v.name} - ₦{v.amount}</option>)}
          </select>

          <label className="block mb-2 font-semibold">
            Customer Number {customerMinLength > 0 && `(min ${customerMinLength} digits)`}
          </label>
          <input
            value={billersCode}
            onChange={e => setBillersCode(e.target.value)}
            placeholder="Enter customer number"
            className="w-full p-3 border rounded mb-4"
          />

          <label className="block mb-2 font-semibold">Phone (optional)</label>
          <input
            value={phone}
            onChange={e => setPhone(e.target.value)}
            placeholder="08012345678"
            className="w-full p-3 border rounded mb-4"
          />

          <label className="block mb-2 font-semibold">Email (optional)</label>
          <input
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="email@example.com"
            className="w-full p-3 border rounded mb-4"
          />

          <p className="mb-4 text-gray-600">Amount: ₦{selectedAmount}</p>
          <button
            onClick={startPayment}
            disabled={loading || !selectedAmount}
            className="w-full bg-blue-600 text-white py-3 rounded"
          >
            {loading ? "Processing..." : "Pay & Purchase"}
          </button>
        </>
      )}

      {stage === "paying" && <p className="text-center py-10">Confirming payment with Paystack…</p>}

      {stage === "success" && (
        <div className="p-4 bg-green-100 border border-green-200 rounded">
          <h2 className="text-xl font-bold mb-3">Purchase Successful 🎉</h2>
          <p><strong>Amount: </strong>₦{receipt.amount}</p>
          <p><strong>Reference: </strong>{receipt.reference}</p>

          <hr className="my-4" />
          <button
            className="w-full bg-blue-600 text-white py-3 rounded"
            onClick={() => {
              setStage("form");
              setSelectedCountry("");
              setSelectedProductType("");
              setSelectedOperator("");
              setSelectedVariation("");
              setBillersCode("");
              setPhone("");
              setEmail("");
              setSelectedAmount(0);
              setReceipt(null);
            }}
          >
            Purchase Again
          </button>
        </div>
      )}
    </div>
  );
}
