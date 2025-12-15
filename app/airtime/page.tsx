"use client";

import React, { useState } from "react";
import api from "@/lib/api";
import ResponsiveLandingWrapper from "@/components/ResponsiveLandingWrapper";
import BannersWrapper from "@/components/BannersWrapper";

export default function AirtimePage() {
  const [phone, setPhone] = useState("");
  const [amount, setAmount] = useState("");
  const [serviceID, setServiceID] = useState("");
  const [loading, setLoading] = useState(false);
  const [stage, setStage] = useState<"form" | "paying" | "success">("form");
  const [receipt, setReceipt] = useState<any>(null);

  const NETWORKS = [
    { id: "mtn", label: "MTN" },
    { id: "glo", label: "GLO" },
    { id: "airtel", label: "Airtel" },
    { id: "9mobile", label: "9Mobile" }
  ];

  async function startPayment() {
    if (!phone || !amount || !serviceID)
      return alert("Fill all required fields");

    try {
      setLoading(true);

      const reference = `AIRTIME-${Date.now()}`;

      const initRes = await api.post("/paystack/initialize", {
        email: "guest@nexa-pay.app",
        amount: Number(amount) * 100, // convert naira → kobo
        reference,
        metadata: {
          purpose: "airtime_purchase",
          phone,
          serviceID,
          amount: Number(amount),
        },
        callback_url: `${window.location.origin}/airtime?ref=${reference}`
      });

      const authUrl = initRes.data.data.authorization_url;

      // redirect to Paystack
      window.location.href = authUrl;

    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || "Payment init failed");
    } finally {
      setLoading(false);
    }
  }

  async function verifyAndPurchase(reference: string) {
    try {
      setStage("paying");

      const verify = await api.get(`/paystack/verify/${reference}`);

      if (verify.data.status !== "success") {
        alert("Payment not completed");
        setStage("form");
        return;
      }

      // Now trigger airtime purchase
      const buy = await api.post("/vtpass/airtime/local", {
        phone,
        amount,
        serviceID
      });

      setReceipt({
        reference,
        phone,
        amount,
        serviceID,
        vtpass: buy.data.result
      });

      setStage("success");
    } catch (err: any) {
      console.error(err);
      alert("Airtime purchase failed");
      setStage("form");
    }
  }

  // detect redirect
  React.useEffect(() => {
    const url = new URL(window.location.href);
    const ref = url.searchParams.get("ref");

    if (ref) verifyAndPurchase(ref);
  }, []);

  return (
  <ResponsiveLandingWrapper>
    <BannersWrapper page="airtime">
      <div className="max-w-lg mx-auto p-5">

        <h1 className="text-2xl font-bold mb-4">Buy Airtime</h1>

        {stage === "form" && (
          <>
            <label className="block mb-2 font-semibold">Network</label>
            <select
              value={serviceID}
              onChange={(e) => setServiceID(e.target.value)}
              className="w-full p-3 border rounded mb-4"
            >
              <option value="">Select Network</option>
              {NETWORKS.map((n) => (
                <option key={n.id} value={n.id}>
                  {n.label}
                </option>
              ))}
            </select>

            <label className="block mb-2 font-semibold">Phone Number</label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="08012345678"
              className="w-full p-3 border rounded mb-4"
            />

            <label className="block mb-2 font-semibold">Amount (₦)</label>
            <input
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full p-3 border rounded mb-4"
            />

            <button
              onClick={startPayment}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-md transition-colors"
            >
              {loading ? "Processing..." : "Pay & Buy Airtime"}
            </button>
          </>
        )}

        {stage === "paying" && (
          <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 text-center">
            <p className="py-10">Confirming payment with Paystack…</p>
          </div>
        )}

        {stage === "success" && receipt && (
          <div className="bg-green-100 dark:bg-green-900 border border-green-200 dark:border-green-800 p-4 rounded">
            <h2 className="text-xl font-bold mb-3">
              Airtime Successfully Purchased 🎉
            </h2>

            <p><strong>Phone:</strong> {receipt.phone}</p>
            <p><strong>Amount:</strong> ₦{receipt.amount}</p>
            <p><strong>Network:</strong> {receipt.serviceID}</p>
            <p><strong>Reference:</strong> {receipt.reference}</p>

            <hr className="my-4" />

            <button
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded transition-colors"
              onClick={() => {
                setStage("form");
                setReceipt(null);
                setPhone("");
                setAmount("");
                setServiceID("");
              }}
            >
              Buy Again
            </button>
          </div>
        )}
      </div>
    </BannersWrapper>
  </ResponsiveLandingWrapper>
);

}
