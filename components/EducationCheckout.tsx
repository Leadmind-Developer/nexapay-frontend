"use client";
import { useEffect, useState } from "react";
import api from "@/lib/api";

export default function EducationCheckout({
  title,
  serviceID,
  requiresVerification,
  verifyEndpoint,
}: any) {
  const [variations, setVariations] = useState([]);
  const [variation, setVariation] = useState("");
  const [billersCode, setBillersCode] = useState("");
  const [phone, setPhone] = useState("");
  const [stage, setStage] = useState("form");

  useEffect(() => {
    api.get(`/vtpass/education/${serviceID}/variations`)
      .then(r => setVariations(r.data || []));
  }, []);

  const checkout = async () => {
    setStage("processing");
    await api.post("/vtpass/education/checkout", {
      serviceID,
      variation_code: variation,
      billersCode,
      phone,
    });
    setStage("success");
  };

  const verifyAndPay = async () => {
    if (!requiresVerification) return checkout();
    setStage("verifying");
    await api.post(verifyEndpoint!, {
      billersCode,
      variation_code: variation,
    });
    checkout();
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded shadow">
      <h2 className="font-bold text-xl">{title}</h2>

      <select onChange={e => setVariation(e.target.value)}>
        <option value="">Select Type</option>
        {variations.map((v: any) => (
          <option key={v.variation_code} value={v.variation_code}>
            {v.name} – ₦{v.amount}
          </option>
        ))}
      </select>

      <input placeholder="Profile / Candidate No" onChange={e => setBillersCode(e.target.value)} />
      <input placeholder="Phone Number" onChange={e => setPhone(e.target.value)} />

      <button onClick={verifyAndPay}>
        {requiresVerification ? "Verify & Pay" : "Pay"}
      </button>

      {stage === "success" && <p>Purchase successful 🎉</p>}
    </div>
  );
}
