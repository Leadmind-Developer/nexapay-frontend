"use client";

import React, { useEffect, useRef, useState } from "react";
import api, { VTPassAPI } from "@/lib/api";

import SEO from "@/components/SEO";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import LandingSidebar from "@/components/LandingSidebar";

/* =======================
   Types
======================= */

interface Disco {
  code: string;
  name: string;
  label: string;
}

interface ElectricityReceipt {
  request_id: string;
  amount: number;
  status: string;
  customer_name?: string;
  token?: string;
  meter_number?: string;
  type?: "prepaid" | "postpaid";
}

interface VerifyMeterResponse {
  customer_name: string;
}

interface PaystackVerifyResponse {
  status: "success" | string;
  metadata?: {
    request_id?: string;
  };
}

interface VTpassStatusResponse {
  amount?: number;
  purchased_amount?: number;
  response_description?: string;
  status?: string;
  customer_name?: string;
  token?: string;
  token_code?: string;
  billersCode?: string;
  billers_code?: string;
  variation_code?: "prepaid" | "postpaid";
}

/* =======================
   Page
======================= */

export default function ElectricityPage() {
  /* ---------- Layout refs ---------- */
  const headerRef = useRef<HTMLDivElement | null>(null);
  const [headerHeight, setHeaderHeight] = useState(0);

  /* ---------- State ---------- */
  const [discos, setDiscos] = useState<Disco[]>([]);
  const [serviceID, setServiceID] = useState("");
  const [billersCode, setBillersCode] = useState("");
  const [type, setType] = useState<"prepaid" | "postpaid">("prepaid");
  const [amount, setAmount] = useState(0);
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  const [customerName, setCustomerName] = useState("");
  const [verified, setVerified] = useState(false);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const [stage, setStage] = useState<"form" | "verifying" | "success">("form");
  const [receipt, setReceipt] = useState<ElectricityReceipt | null>(null);

  /* =======================
     Track Header Height
  ======================= */
  useEffect(() => {
    if (!headerRef.current) return;

    const update = () =>
      setHeaderHeight(headerRef.current?.offsetHeight || 0);

    update();
    const observer = new ResizeObserver(update);
    observer.observe(headerRef.current);

    window.addEventListener("resize", update);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", update);
    };
  }, []);

  /* =======================
     Load Discos
  ======================= */
  useEffect(() => {
    api
      .get<Disco[]>("/vtpass/electricity/discos")
      .then((res) => {
        const data = res.data || [];
        setDiscos(data);
        if (data.length) setServiceID(data[0].code);
      })
      .catch(() => {
        setMessage("Failed to load electricity providers");
      });
  }, []);

  /* =======================
     Paystack Redirect
  ======================= */
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const reference = params.get("reference");
    if (reference) verifyTransaction(reference);
  }, []);

  /* =======================
     Verify Meter
  ======================= */
  const handleVerifyMeter = async () => {
    if (!serviceID || !billersCode) {
      setMessage("Please select a Disco and enter meter number");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const res = await VTPassAPI.verify<VerifyMeterResponse>({
        serviceID,
        billersCode,
        type,
      });

      setCustomerName(res.data.customer_name);
      setVerified(true);
      setMessage(`Meter verified: ${res.data.customer_name}`);
    } catch (err: any) {
      setVerified(false);
      setCustomerName("");
      setMessage(err.response?.data?.message || "Meter verification failed");
    } finally {
      setLoading(false);
    }
  };

  /* =======================
     Purchase + Paystack
  ======================= */
  const handlePurchase = async () => {
    if (!verified) return setMessage("Please verify meter first");
    if (!amount || !phone)
      return setMessage("Amount and phone number are required");

    setLoading(true);
    setMessage("");

    try {
      const request_id = crypto.randomUUID();

      await VTPassAPI.pay({
        request_id,
        serviceID,
        billersCode,
        variation_code: type,
        amount,
        phone,
      });

      const reference = `ELEC-${Date.now()}`;
      const guestEmail = email || `${phone}@nexapay.fake`;

      const ps = await api.post("/paystack/initialize", {
        amount,
        email: guestEmail,
        reference,
        callback_url: `${window.location.origin}/electricity?reference=${reference}`,
        metadata: { request_id, purpose: "electricity_purchase" },
      });

      window.location.href = ps.data.data.authorization_url;
    } catch (err: any) {
      setMessage(err.response?.data?.message || "Payment initialization failed");
    } finally {
      setLoading(false);
    }
  };

  /* =======================
     Verify Transaction
  ======================= */
  const verifyTransaction = async (reference: string) => {
    setStage("verifying");
    setLoading(true);

    try {
      const ps = await api.get<PaystackVerifyResponse>(
        `/paystack/verify/${reference}`
      );

      if (ps.data.status !== "success")
        return setStage("form");

      const request_id = ps.data.metadata?.request_id;
      if (!request_id) return setStage("form");

      const vt = await api.post<VTpassStatusResponse>(
        "/vtpass/electricity/status",
        { request_id }
      );

      const v = vt.data;

      setReceipt({
        request_id,
        amount: Number(v.amount || v.purchased_amount || 0),
        status: v.response_description || v.status || "success",
        customer_name: v.customer_name,
        token: v.token || v.token_code,
        meter_number: v.billersCode || v.billers_code,
        type: v.variation_code,
      });

      setStage("success");
    } catch {
      setStage("form");
      setMessage("Verification failed");
    } finally {
      setLoading(false);
    }
  };

  /* =======================
     Layout
  ======================= */
  return (
    <>
      <SEO
        title="Buy Electricity | NexaPay"
        description="Buy prepaid and postpaid electricity tokens instantly on NexaPay."
      />

      <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Sidebar */}
        <div className="hidden sm:block">
          <LandingSidebar />
        </div>

        {/* Main */}
        <main className="flex-1 sm:ml-32 flex flex-col">
          {/* Header */}
          <div
            ref={headerRef}
            className="fixed top-0 left-0 sm:left-32 right-0 z-50 bg-white dark:bg-gray-900 border-b shadow-sm"
          >
            <Header />
          </div>

          {/* Content */}
          <div style={{ paddingTop: headerHeight }} className="flex-grow">
            <div className="max-w-lg mx-auto p-6">
              {stage === "verifying" && <p>Verifying transaction...</p>}

              {stage === "success" && receipt && (
                <div className="bg-green-100 p-4 rounded">
                  <h2 className="font-bold text-lg mb-2">
                    Electricity Purchase Successful 🎉
                  </h2>
                  <p><strong>Meter:</strong> {receipt.meter_number}</p>
                  <p><strong>Amount:</strong> ₦{receipt.amount}</p>

                  {receipt.token && (
                    <div className="mt-4 bg-white p-3 rounded">
                      <p className="font-bold text-xl">{receipt.token}</p>
                    </div>
                  )}
                </div>
              )}

              {stage === "form" && (
                <>
                  <h1 className="text-2xl font-bold mb-4">Buy Electricity</h1>

                  {/* --- form fields unchanged --- */}
                  {/* Disco */}
                  <select
                    value={serviceID}
                    onChange={(e) => setServiceID(e.target.value)}
                    className="w-full mb-3 p-3 border rounded"
                  >
                    {discos.map((d) => (
                      <option key={d.code} value={d.code}>
                        {d.label}
                      </option>
                    ))}
                  </select>

                  {/* Meter */}
                  <input
                    placeholder="Meter Number"
                    value={billersCode}
                    onChange={(e) => {
                      setBillersCode(e.target.value);
                      setVerified(false);
                    }}
                    className="w-full mb-3 p-3 border rounded"
                  />

                  <button
                    onClick={handleVerifyMeter}
                    disabled={loading}
                    className="w-full bg-gray-800 text-white p-3 rounded mb-3"
                  >
                    Verify Meter
                  </button>

                  <input
                    type="number"
                    placeholder="Amount"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full mb-3 p-3 border rounded"
                  />

                  <input
                    placeholder="Phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full mb-3 p-3 border rounded"
                  />

                  <input
                    placeholder="Email (optional)"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full mb-3 p-3 border rounded"
                  />

                  {message && (
                    <p className={`mb-3 ${verified ? "text-green-600" : "text-red-600"}`}>
                      {message}
                    </p>
                  )}

                  <button
                    onClick={handlePurchase}
                    disabled={!verified || loading}
                    className="w-full bg-blue-600 text-white p-3 rounded"
                  >
                    Pay & Get Token
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Footer */}
          <Footer />
        </main>
      </div>
    </>
  );
}
