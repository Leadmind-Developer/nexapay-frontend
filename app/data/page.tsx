"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import api from "@/lib/api";
import ResponsiveLandingWrapper from "@/components/ResponsiveLandingWrapper";
import BannersWrapper from "@/components/BannersWrapper";

type Variation = {
  variation_code: string;
  name: string;
  variation_amount: number;
};

export default function DataPurchasePage() {
  const [provider, setProvider] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [variations, setVariations] = useState<Variation[]>([]);
  const [selectedVar, setSelectedVar] = useState<Variation | null>(null);
  const [loadingPlans, setLoadingPlans] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [stage, setStage] = useState<"form" | "review" | "paying" | "pending" | "success" | "error">("form");
  const [receipt, setReceipt] = useState<any>(null);
  const [statusMessage, setStatusMessage] = useState("");

  const [recentPhones, setRecentPhones] = useState<string[]>([]);
  const [recentEmails, setRecentEmails] = useState<string[]>([]);
  const pollingRef = useRef<number | null>(null);

  const PROVIDERS = [
    { label: "MTN", value: "mtn", icon: "/images/icons/MTN_logo.png" },
    { label: "GLO", value: "glo", icon: "/images/icons/Glo_button.png" },
    { label: "Airtel", value: "airtel", icon: "/images/icons/Airtel_logo.png" },
    { label: "9mobile", value: "etisalat", icon: "/images/icons/9Mobile-Telecom-Logo.jpg" },
    { label: "Spectranet", value: "spectranet", icon: "/images/icons/spectranet.png" },
    { label: "Smile", value: "smile", icon: "/images/icons/smile.png" },
  ];

  // Load recent billers/emails from localStorage
  useEffect(() => {
    const storedPhones = JSON.parse(localStorage.getItem("recentPhones") || "[]");
    const storedEmails = JSON.parse(localStorage.getItem("recentEmails") || "[]");
    setRecentPhones(storedPhones);
    setRecentEmails(storedEmails);
  }, []);

  const saveRecent = (phone: string, email: string) => {
    const newPhones = [phone, ...recentPhones.filter(p => p !== phone)].slice(0, 5);
    const newEmails = [email, ...recentEmails.filter(e => e !== email)].slice(0, 5);
    localStorage.setItem("recentPhones", JSON.stringify(newPhones));
    localStorage.setItem("recentEmails", JSON.stringify(newEmails));
    setRecentPhones(newPhones);
    setRecentEmails(newEmails);
  };

  // Auto-detect provider from phone
  useEffect(() => {
    if (email.includes("@smile")) {
      setProvider("smile");
    } else if (phone) {
    const prefix = phone.replace(/^234/, "0").slice(0, 4);
    const MTN = ["0703","0706","0803","0806","0810","0813","0814","0816","0903","0906","0913"];
    const GLO = ["0705","0805","0807","0811","0815","0905"];
    const AIRTEL = ["0701","0708","0802","0808","0812","0901","0902","0904","0912"];
    const ETISALAT = ["0709","0809","0817","0818","0908","0909"];
    if (MTN.includes(prefix)) setProvider("mtn");
    else if (GLO.includes(prefix)) setProvider("glo");
    else if (AIRTEL.includes(prefix)) setProvider("airtel");
    else if (ETISALAT.includes(prefix)) setProvider("etisalat");
   }
  }, [phone, email]);

  const loadVariations = async (prov: string) => {
    if (!prov) return;
    setLoadingPlans(true);
    setVariations([]);
    setSelectedVar(null);
    try {
      const res = await api.get(`/vtpass/data/variations/${prov}`);
      setVariations(res.data.variations || []);
    } catch (err) {
      console.error(err);
      alert("Failed to load plans.");
    } finally {
      setLoadingPlans(false);
    }
  };

  const startPayment = () => {
    if (!selectedVar || !email || !provider || !phone) return alert("Fill all required fields");
    saveRecent(phone, email);
    setStage("review");
  };

  const confirmPayment = async () => {
    if (!selectedVar || !email || !provider || !phone) return;
    try {
      setProcessing(true);
      setStage("paying");
      const reference = `DATA-${Date.now()}`;
      const initRes = await api.post("/paystack/initialize", {
        email,
        amount: selectedVar.variation_amount * 100,
        reference,
        metadata: { purpose: "data_purchase", provider, billersCode: phone, variation_code: selectedVar.variation_code, amount: selectedVar.variation_amount },
        callback_url: `${window.location.origin}/data?ref=${reference}`,
      });
      window.location.href = initRes.data.data.authorization_url;
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || "Payment initialization failed");
      setProcessing(false);
      setStage("form");
    }
  };

  const selectedProvider = PROVIDERS.find(p => p.value === provider);

  return (
    <ResponsiveLandingWrapper>
      <BannersWrapper page="data">
        <div className="max-w-lg mx-auto p-6">
          <h1 className="text-2xl font-bold mb-4">Buy Data / Internet</h1>

          {stage === "form" && (
            <>
              {/* Phone Input with suggestions */}
              <div className="relative mb-3">
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full p-3 border rounded"
                  placeholder="Phone number"
                />
                {phone && recentPhones.length > 0 && (
                  <ul className="absolute z-10 w-full bg-white border mt-1 rounded shadow-sm max-h-40 overflow-auto">
                    {recentPhones.filter(p => p.includes(phone)).map((p, i) => (
                      <li
                        key={i}
                        className="p-2 hover:bg-gray-100 cursor-pointer"
                        onClick={() => setPhone(p)}
                      >
                        {p}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Email Input with suggestions */}
              <div className="relative mb-3">
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-3 border rounded"
                  placeholder="Email for receipt"
                />
                {email && recentEmails.length > 0 && (
                  <ul className="absolute z-10 w-full bg-white border mt-1 rounded shadow-sm max-h-40 overflow-auto">
                    {recentEmails.filter(e => e.includes(email)).map((e, i) => (
                      <li
                        key={i}
                        className="p-2 hover:bg-gray-100 cursor-pointer"
                        onClick={() => setEmail(e)}
                      >
                        {e}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <select
                className="w-full p-3 border rounded mb-3"
                value={provider}
                onChange={(e) => {
                  setProvider(e.target.value);
                  loadVariations(e.target.value);
                }}
              >
                <option value="">Select Provider</option>
                {PROVIDERS.map((p) => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>

              {loadingPlans ? <p>Loading plans...</p> : (
                variations.length > 0 && (
                  <select
                    className="w-full p-3 border rounded mb-3"
                    value={selectedVar?.variation_code || ""}
                    onChange={(e) => {
                      const v = variations.find(x => x.variation_code === e.target.value);
                      setSelectedVar(v || null);
                    }}
                  >
                    <option value="">Select Data Bundle</option>
                    {variations.map(v => (
                      <option key={v.variation_code} value={v.variation_code}>{v.name} — ₦{v.variation_amount}</option>
                    ))}
                  </select>
                )
              )}

              <button
                onClick={startPayment}
                disabled={!selectedVar || !email || !provider || !phone}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white p-3 rounded transition-colors"
              >
                Review & Pay
              </button>
            </>
          )}

          {stage === "review" && selectedVar && (
            <div>
              <motion.div
                whileHover={{ scale: 1.03, boxShadow: "0 8px 20px rgba(0,0,0,0.12)" }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="flex items-center gap-4 p-4 mb-6 bg-white border rounded-xl shadow-sm cursor-pointer"
              >
                {selectedProvider && (
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                    <Image src={selectedProvider.icon} alt={selectedProvider.label} width={28} height={28}/>
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">Review</h3>
                  <p><span className="font-medium">Provider:</span> {selectedProvider?.label}</p>
                  <p><span className="font-medium">Phone:</span> {phone}</p>
                  <p><span className="font-medium">Email:</span> {email}</p>
                  <p><span className="font-medium">Bundle:</span> {selectedVar.name}</p>
                  <p><span className="font-medium">Amount:</span> ₦{selectedVar.variation_amount}</p>
                </div>
              </motion.div>

              <div className="flex justify-between">
                <button
                  onClick={() => setStage("form")}
                  className="bg-gray-200 text-gray-700 py-3 px-6 rounded-xl font-bold transition"
                >
                  Back
                </button>
                <button
                  onClick={confirmPayment}
                  disabled={processing}
                  className="bg-blue-600 text-white py-3 px-6 rounded-xl font-bold disabled:opacity-60 transition"
                >
                  {processing ? "Processing..." : "Pay & Buy Data"}
                </button>
              </div>
            </div>
          )}
        </div>
      </BannersWrapper>
    </ResponsiveLandingWrapper>
  );
}
