"use client";

import React, { useState, useEffect, useRef } from "react";
import api from "@/lib/api";

type Variation = {
  variation_code: string;
  name: string;
  variation_amount: number;
};

type ServiceOption = {
  label: string;
  value: string;
};

export default function CablePurchasePage() {
  const [service, setService] = useState<string>("");
  const [smartcard, setSmartcard] = useState("");
  const [variations, setVariations] = useState<Variation[]>([]);
  const [selectedVar, setSelectedVar] = useState<Variation | null>(null);
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [loadingPlans, setLoadingPlans] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [smartcardValid, setSmartcardValid] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [stage, setStage] = useState<"form" | "paying" | "pending" | "success" | "error">("form");
  const [receipt, setReceipt] = useState<any>(null);
  const [statusMessage, setStatusMessage] = useState("");

  const pollingRef = useRef<number | null>(null); // <-- number type
  const verifyTimeout = useRef<number | null>(null); // <-- number type

  const SERVICES: ServiceOption[] = [
    { label: "DStv", value: "dstv" },
    { label: "GOtv", value: "gotv" },
    { label: "Startimes", value: "startimes" },
    { label: "Showmax", value: "showmax" },
  ];

  // Auto-verify smartcard whenever service or smartcard changes
  useEffect(() => {
    if (!service || !smartcard) {
      setSmartcardValid(false);
      setVariations([]);
      setSelectedVar(null);
      return;
    }

    // Clear previous timeout
    if (verifyTimeout.current) window.clearTimeout(verifyTimeout.current);

    verifyTimeout.current = window.setTimeout(async () => {
      setVerifying(true);
      setSmartcardValid(false);
      setVariations([]);
      setSelectedVar(null);

      try {
        const res = await api.post("/vtpass/cable/verify", { service, smartcard });
        if (res.data?.content?.customer_name) {
          setSmartcardValid(true);
          loadVariations(service);
        } else {
          setSmartcardValid(false);
        }
      } catch (err) {
        console.error(err);
        setSmartcardValid(false);
      } finally {
        setVerifying(false);
      }
    }, 700); // debounce 700ms
  }, [service, smartcard]);

  const loadVariations = async (serviceID: string) => {
    if (!serviceID || !smartcardValid) return;
    setLoadingPlans(true);
    setVariations([]);
    setSelectedVar(null);

    try {
      const res = await api.get(`/vtpass/cable/variations?service=${serviceID}`);
      setVariations(res.data.variations || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingPlans(false);
    }
  };

  const pollCableStatus = async (request_id: string) => {
    if (pollingRef.current) return;
    setStage("pending");
    setStatusMessage("Transaction submitted...");

    pollingRef.current = window.setInterval(async () => {
      try {
        const res = await api.post(`/vtpass/cable/status`, { request_id });
        const status = res.data?.content?.transactions?.status;

        if (["completed", "delivered", "success"].includes(status)) {
          if (pollingRef.current) window.clearInterval(pollingRef.current);
          pollingRef.current = null;
          setStatusMessage("🎉 Cable purchase successful!");
          setStage("success");
          setProcessing(false);
        } else if (["failed", "error"].includes(status)) {
          if (pollingRef.current) window.clearInterval(pollingRef.current);
          pollingRef.current = null;
          setStatusMessage("❌ Cable purchase failed. You can retry.");
          setStage("error");
          setProcessing(false);
        }
      } catch (err) {
        console.error(err);
      }
    }, 5000);
  };

  const verifyAndPurchase = async (reference: string) => {
    if (!selectedVar) return;

    try {
      setProcessing(true);
      setStage("paying");

      const verify = await api.get(`/paystack/verify/${reference}`);
      if (verify.data.status !== "success") {
        alert("Payment not completed");
        setStage("form");
        setProcessing(false);
        return;
      }

      const purchase = await api.post("/vtpass/cable/purchase", {
        request_id: `CABLE-${Date.now()}`,
        service,
        smartcard,
        variation_code: selectedVar.variation_code,
        amount: selectedVar.variation_amount,
        phone,
      });

      setReceipt({
        reference,
        service,
        smartcard,
        variation: selectedVar,
        vtpass: purchase.data.result,
      });

      pollCableStatus(purchase.data.request_id);
    } catch (err) {
      console.error(err);
      setStatusMessage("❌ Cable purchase failed. You can retry.");
      setStage("error");
      setProcessing(false);
    }
  };

  const startPayment = async () => {
    if (!selectedVar || !email || !service || !smartcard || !smartcardValid)
      return alert("Fill all required fields and verify smartcard");

    try {
      setProcessing(true);
      setStage("paying");

      const reference = `CABLE-${Date.now()}`;
      const initRes = await api.post("/paystack/initialize", {
        email,
        amount: selectedVar.variation_amount * 100,
        reference,
        metadata: {
          purpose: "cable_purchase",
          service,
          smartcard,
          variation_code: selectedVar.variation_code,
          amount: selectedVar.variation_amount,
          phone,
        },
        callback_url: `${window.location.origin}/cable?ref=${reference}`,
      });

      window.location.href = initRes.data.data.authorization_url;
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || "Payment initialization failed");
      setProcessing(false);
      setStage("form");
    }
  };

  // Detect redirect after Paystack checkout
  useEffect(() => {
    const url = new URL(window.location.href);
    const ref = url.searchParams.get("ref");
    if (ref && selectedVar && service && smartcard) {
      verifyAndPurchase(ref);
    }
  }, [selectedVar, service, smartcard]);

  return (
    <div className="max-w-lg mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Buy Cable Subscription</h1>

      {stage === "form" && (
        <>
          <input
            value={smartcard}
            onChange={(e) => {
              setSmartcard(e.target.value);
              setSmartcardValid(false);
              setVariations([]);
              setSelectedVar(null);
            }}
            className="w-full p-3 border rounded mb-3"
            placeholder="Smartcard Number"
          />
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full p-3 border rounded mb-3"
            placeholder="Phone Number (optional)"
          />
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 border rounded mb-3"
            placeholder="Email (for payment receipt)"
          />

          <select
            className="w-full p-3 border rounded mb-3"
            value={service}
            onChange={(e) => {
              setService(e.target.value);
              setSmartcardValid(false);
              setVariations([]);
              setSelectedVar(null);
            }}
          >
            <option value="">Select Service</option>
            {SERVICES.map(s => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>

          {verifying && <p className="mb-3 text-gray-500">Verifying smartcard...</p>}

          {smartcardValid && (
            <>
              {loadingPlans ? (
                <p>Loading packages...</p>
              ) : (
                variations.length > 0 && (
                  <select
                    className="w-full p-3 border rounded mb-3"
                    value={selectedVar?.variation_code || ""}
                    onChange={(e) => {
                      const v = variations.find(x => x.variation_code === e.target.value);
                      setSelectedVar(v || null);
                    }}
                  >
                    <option value="">Select Package</option>
                    {variations.map(v => (
                      <option key={v.variation_code} value={v.variation_code}>
                        {v.name} — ₦{v.variation_amount}
                      </option>
                    ))}
                  </select>
                )
              )}

              <button
                onClick={startPayment}
                disabled={!selectedVar || !email || processing}
                className="w-full bg-blue-600 text-white p-3 rounded"
              >
                {processing ? "Processing..." : "Pay & Buy Cable"}
              </button>
            </>
          )}
        </>
      )}

      {(stage === "paying" || stage === "pending") && (
        <p className="text-center py-10">{stage === "paying" ? "Redirecting to Paystack…" : statusMessage}</p>
      )}

      {stage === "error" && (
        <div className="p-4 bg-red-100 border border-red-200 rounded">
          <p className="mb-3">{statusMessage}</p>
          <button
            className="w-full bg-yellow-600 text-white py-3 rounded"
            onClick={() => {
              if (receipt && receipt.vtpass?.request_id) pollCableStatus(receipt.vtpass.request_id);
            }}
            disabled={!!pollingRef.current}
          >
            Retry Purchase
          </button>
        </div>
      )}

      {stage === "success" && receipt && (
        <div className="p-4 bg-green-100 border border-green-200 rounded">
          <h2 className="text-xl font-bold mb-3">Cable Purchase Successful 🎉</h2>
          <p><strong>Service:</strong> {receipt.service}</p>
          <p><strong>Smartcard:</strong> {receipt.smartcard}</p>
          <p><strong>Package:</strong> {receipt.variation?.name}</p>
          <p><strong>Amount:</strong> ₦{receipt.variation?.variation_amount}</p>
          <p><strong>Reference:</strong> {receipt.reference}</p>

          <hr className="my-4" />

          <button
            className="w-full bg-blue-600 text-white py-3 rounded"
            onClick={() => {
              setStage("form");
              setReceipt(null);
              setSelectedVar(null);
              setSmartcardValid(false);
              setVariations([]);
              setStatusMessage("");
            }}
          >
            Buy Again
          </button>
        </div>
      )}
    </div>
  );
}
