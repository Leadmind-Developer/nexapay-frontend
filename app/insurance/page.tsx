"use client";

import React, { useEffect, useState } from "react";
import api from "@/lib/api";

interface Variation {
  name: string;
  variation_code: string;
  amount: number;
  requiredFields?: string[]; // added: list of required fields
}

export default function InsurancePage() {
  const [serviceID, setServiceID] = useState("ui-insure");
  const [variationCode, setVariationCode] = useState("");
  const [billersCode, setBillersCode] = useState("");
  const [phone, setPhone] = useState("");
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
  const [email, setEmail] = useState("");

  const [loading, setLoading] = useState(false);
  const [stage, setStage] = useState<"form" | "verifying" | "paying" | "success">("form");
  const [receipt, setReceipt] = useState<any>(null);
  const [variations, setVariations] = useState<Variation[]>([]);
  const [selectedAmount, setSelectedAmount] = useState<number>(0);

  // Fetch variations
  useEffect(() => {
    api.get(`/vtpass/insurance/variations?serviceID=${serviceID}`)
      .then(res => setVariations(res.data))
      .catch(err => {
        console.error(err);
        alert("Failed to load insurance plans");
      });
  }, [serviceID]);

  // Update amount when variation changes
  useEffect(() => {
    const selected = variations.find(v => v.variation_code === variationCode);
    setSelectedAmount(selected ? selected.amount : 0);
  }, [variationCode, variations]);

  // Dynamic field validation
  function validateFields(): string | null {
    const selected = variations.find(v => v.variation_code === variationCode);
    if (!selected) return "Please select a plan";

    const required = selected.requiredFields || [];
    for (const field of required) {
      if (
        (field === "insuredName" && !insuredName) ||
        (field === "engineCapacity" && !engineCapacity) ||
        (field === "chasisNumber" && !chasisNumber) ||
        (field === "plateNumber" && !plateNumber) ||
        (field === "vehicleMake" && !vehicleMake) ||
        (field === "vehicleModel" && !vehicleModel) ||
        (field === "vehicleColor" && !vehicleColor) ||
        (field === "yearOfMake" && !yearOfMake) ||
        (field === "state" && !state) ||
        (field === "lga" && !lga) ||
        (field === "email" && !email)
      ) {
        return `Field "${field}" is required for this plan`;
      }
    }
    return null;
  }

  // Verify customer before payment
  async function verifyCustomer() {
    if (!billersCode || !variationCode) return alert("Fill all required fields");

    const validationError = validateFields();
    if (validationError) return alert(validationError);

    try {
      setStage("verifying");
      const res = await api.post("/vtpass/insurance/verify", { serviceID, billersCode });
      if (res.data && res.data.status === "success") {
        startPayment();
      } else {
        alert(res.data?.message || "Customer verification failed");
        setStage("form");
      }
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || "Customer verification failed");
      setStage("form");
    }
  }

  // Start Paystack payment
  async function startPayment() {
    try {
      setLoading(true);
      const reference = `INS-${Date.now()}`;
      const initRes = await api.post("/paystack/initialize", {
        email: email || "guest@nexa-pay.app",
        amount: selectedAmount * 100,
        reference,
        metadata: { purpose: "insurance_purchase", serviceID, billersCode, variationCode, phone },
        callback_url: `${window.location.origin}/insurance?ref=${reference}`
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

      const buy = await api.post("/vtpass/insurance/purchase", {
        request_id: reference,
        userId: 0,
        paymentId: verify.data.data.id,
        serviceID,
        billersCode,
        variation_code: variationCode,
        phone,
        Insured_Name: insuredName,
        engine_capacity: engineCapacity,
        Chasis_Number: chasisNumber,
        Plate_Number: plateNumber,
        vehicle_make: vehicleMake,
        vehicle_model: vehicleModel,
        vehicle_color: vehicleColor,
        YearofMake: yearOfMake,
        state,
        lga,
        email
      });

      setReceipt({ reference, variationCode, billersCode, amount: selectedAmount, vtpass: buy.data });
      setStage("success");
    } catch (err: any) {
      console.error(err);
      alert("Insurance purchase failed");
      setStage("form");
    }
  }

  useEffect(() => {
    const url = new URL(window.location.href);
    const ref = url.searchParams.get("ref");
    if (ref) verifyAndPurchase(ref);
  }, []);

  return (
    <div className="max-w-lg mx-auto p-5">
      <h1 className="text-2xl font-bold mb-4">Purchase Insurance</h1>

      {stage === "form" && (
        <>
          <label className="block mb-2 font-semibold">Plan</label>
          <select
            value={variationCode}
            onChange={e => setVariationCode(e.target.value)}
            className="w-full p-3 border rounded mb-4"
          >
            <option value="">Select Plan</option>
            {variations.map(v => (
              <option key={v.variation_code} value={v.variation_code}>
                {v.name} - ₦{v.amount}
              </option>
            ))}
          </select>

          <label className="block mb-2 font-semibold">Customer Number</label>
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

          <label className="block mb-2 font-semibold">Insured Name</label>
          <input
            value={insuredName}
            onChange={e => setInsuredName(e.target.value)}
            placeholder="Full name"
            className="w-full p-3 border rounded mb-4"
          />

          <label className="block mb-2 font-semibold">Vehicle Details</label>
          <input value={vehicleMake} onChange={e => setVehicleMake(e.target.value)} placeholder="Vehicle make" className="w-full p-3 border rounded mb-2" />
          <input value={vehicleModel} onChange={e => setVehicleModel(e.target.value)} placeholder="Vehicle model" className="w-full p-3 border rounded mb-2" />
          <input value={vehicleColor} onChange={e => setVehicleColor(e.target.value)} placeholder="Vehicle color" className="w-full p-3 border rounded mb-2" />
          <input value={engineCapacity} onChange={e => setEngineCapacity(e.target.value)} placeholder="Engine capacity" className="w-full p-3 border rounded mb-2" />
          <input value={chasisNumber} onChange={e => setChasisNumber(e.target.value)} placeholder="Chasis number" className="w-full p-3 border rounded mb-2" />
          <input value={plateNumber} onChange={e => setPlateNumber(e.target.value)} placeholder="Plate number" className="w-full p-3 border rounded mb-4" />

          <label className="block mb-2 font-semibold">Additional Info</label>
          <input value={yearOfMake} onChange={e => setYearOfMake(e.target.value)} placeholder="Year of make" className="w-full p-3 border rounded mb-2" />
          <input value={state} onChange={e => setState(e.target.value)} placeholder="State" className="w-full p-3 border rounded mb-2" />
          <input value={lga} onChange={e => setLGA(e.target.value)} placeholder="LGA" className="w-full p-3 border rounded mb-2" />
          <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" className="w-full p-3 border rounded mb-4" />

          <p className="mb-4 text-gray-600">Amount to pay: ₦{selectedAmount}</p>

          <button
            onClick={verifyCustomer}
            disabled={loading || !selectedAmount}
            className="w-full bg-blue-600 text-white text-center py-3 rounded-md"
          >
            {loading ? "Processing..." : "Verify & Pay"}
          </button>
        </>
      )}

      {stage === "verifying" && <p className="text-center py-10">Verifying customer…</p>}
      {stage === "paying" && <p className="text-center py-10">Confirming payment with Paystack…</p>}

      {stage === "success" && (
        <div className="p-4 bg-green-100 border border-green-200 rounded">
          <h2 className="text-xl font-bold mb-3">Insurance Purchase Successful 🎉</h2>
          <p><strong>Plan: </strong>{receipt.variationCode}</p>
          <p><strong>Customer Number: </strong>{receipt.billersCode}</p>
          <p><strong>Amount Paid: </strong>₦{receipt.amount}</p>
          <p><strong>Reference: </strong>{receipt.reference}</p>

          <hr className="my-4" />
          <button
            className="w-full bg-blue-600 text-white py-3 rounded"
            onClick={() => {
              setStage("form");
              setReceipt(null);
              setVariationCode("");
              setBillersCode("");
              setPhone("");
              setInsuredName("");
              setEngineCapacity("");
              setChasisNumber("");
              setPlateNumber("");
              setVehicleMake("");
              setVehicleModel("");
              setVehicleColor("");
              setYearOfMake("");
              setState("");
              setLGA("");
              setEmail("");
              setSelectedAmount(0);
            }}
          >
            Purchase Again
          </button>
        </div>
      )}
    </div>
  );
}
