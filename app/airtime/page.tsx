"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api";
import ResponsiveLandingWrapper from "@/components/ResponsiveLandingWrapper";
import BannersWrapper from "@/components/BannersWrapper";

type Network = {
  id: string;
  label: string;
  icon: string;
};

const NETWORKS: Network[] = [
  { id: "mtn", label: "MTN", icon: "/images/icons/MTN_logo.png" },
  { id: "glo", label: "Glo", icon: "/images/icons/Glo_button.png" },
  { id: "airtel", label: "Airtel", icon: "/images/icons/Airtel_logo.png" },
  { id: "etisalat", label: "9Mobile", icon: "/images/icons/9Mobile-Telecom-Logo.jpg" },
];

const LS_NETWORK_KEY = "nexa:lastNetwork";
const LS_RECENT_PHONES = "nexa:recentPhones";

export default function AirtimePage() {
  const [phone, setPhone] = useState("");
  const [amount, setAmount] = useState("");
  const [serviceID, setServiceID] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0); // 0=Network+Phone, 1=Amount+Review, 2=Payment/Success
  const [receipt, setReceipt] = useState<any>(null);
  const [recentPhones, setRecentPhones] = useState<string[]>([]);

  // Load last network and recent phones
  useEffect(() => {
    const lastNetwork = localStorage.getItem(LS_NETWORK_KEY);
    if (lastNetwork) setServiceID(lastNetwork);

    const storedPhones = localStorage.getItem(LS_RECENT_PHONES);
    if (storedPhones) setRecentPhones(JSON.parse(storedPhones));
  }, []);

  // Persist network selection
  useEffect(() => {
    if (serviceID) localStorage.setItem(LS_NETWORK_KEY, serviceID);
  }, [serviceID]);

  // Auto-detect network
  useEffect(() => {
    if (phone.length >= 4) detectNetwork(phone);
  }, [phone]);

  // Detect redirect from Paystack
  useEffect(() => {
    const url = new URL(window.location.href);
    const ref = url.searchParams.get("ref");
    if (ref) verifyAndPurchase(ref);
  }, []);

  function detectNetwork(phone: string): string | null {
    const prefixes: Record<string, string[]> = {
      mtn: ["0803","0806","0703","0706","0810","0813","0814","0816","0903","0906","0913","0916"],
      glo: ["0805","0807","0705","0811","0815","0905"],
      airtel: ["0802","0808","0701","0708","0812","0902","0907","0901","0912"],
      etisalat: ["0809","0817","0818","0909","0908"],
    };
    const start = phone.replace(/\s+/g, "").slice(0, 4);
    for (const key in prefixes) if (prefixes[key].includes(start)) return key;
    return null;
  }

  async function startPayment() {
    const detectedNetwork = detectNetwork(phone);
    if (!phone || !amount || !serviceID) return alert("Fill all required fields");
    if (detectedNetwork && detectedNetwork !== serviceID)
      return alert(`Selected network does not match phone number (${detectedNetwork.toUpperCase()})`);

    try {
      setLoading(true);
      const reference = `AIRTIME-${Date.now()}`;
      const initRes = await api.post("/paystack/initialize", {
        email: "guest@nexa-pay.app",
        amount: Number(amount) * 100,
        reference,
        metadata: { purpose: "airtime_purchase", phone, serviceID, amount: Number(amount) },
        callback_url: `${window.location.origin}/airtime?ref=${reference}`,
      });
      window.location.href = initRes.data.data.authorization_url;
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || "Payment init failed");
    } finally {
      setLoading(false);
    }
  }

  async function verifyAndPurchase(reference: string) {
    try {
      setStep(2);
      const verify = await api.get(`/paystack/verify/${reference}`);
      if (verify.data.status !== "success") {
        alert("Payment not completed");
        setStep(0);
        return;
      }
      const buy = await api.post("/vtpass/airtime/local", { phone, amount, serviceID });
      setReceipt({ reference, phone, amount, serviceID, vtpass: buy.data.result });

      setRecentPhones((prev) => {
        const updated = [phone, ...prev.filter((p) => p !== phone)].slice(0, 5);
        localStorage.setItem(LS_RECENT_PHONES, JSON.stringify(updated));
        return updated;
      });
    } catch (err: any) {
      console.error(err);
      alert("Airtime purchase failed");
      setStep(0);
    }
  }

  function NetworkSelector({ value, onChange, networks }: { value: string; onChange: (val: string) => void; networks: Network[] }) {
    const [open, setOpen] = useState(false);
    const selected = networks.find((n) => n.id === value);

    return (
      <div className="relative mb-4">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="w-full flex items-center gap-3 p-4 border rounded-xl bg-white shadow-sm active:scale-[0.98] transition"
        >
          {selected ? (
            <>
              <Image src={selected.icon} alt={selected.label} width={28} height={28} />
              <span className="font-medium">{selected.label}</span>
            </>
          ) : (
            <span className="text-gray-400">Select Network</span>
          )}
          <span className="ml-auto text-lg">▾</span>
        </button>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
              className="absolute z-20 mt-2 w-full bg-white border rounded-xl shadow-lg overflow-hidden"
            >
              {networks.map((n) => (
                <button
                  key={n.id}
                  onClick={() => {
                    onChange(n.id);
                    setOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 transition"
                >
                  <Image src={n.icon} alt={n.label} width={26} height={26} />
                  <span className="font-medium">{n.label}</span>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  const detectedNetwork = detectNetwork(phone);
  const steps = ["Network & Phone", "Amount & Review", "Payment"];

  const selectedNetwork = NETWORKS.find(n => n.id === serviceID);

  return (
    <ResponsiveLandingWrapper>
      <BannersWrapper page="airtime">
        <div className="max-w-lg mx-auto p-5">
          <h1 className="text-2xl font-bold mb-4">Buy Airtime</h1>

          {/* Stepper */}
          <div className="flex items-center mb-6">
            {steps.map((label, idx) => (
              <div key={idx} className="flex-1 flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= idx ? "bg-[#39358c] text-white" : "bg-gray-200 text-gray-500"}`}>
                  {idx + 1}
                </div>
                {idx < steps.length - 1 && <div className={`flex-1 h-1 ${step > idx ? "bg-[#39358c]" : "bg-gray-200"} mx-2 rounded`}></div>}
              </div>
            ))}
          </div>

          {/* Step Content */}
          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.25 }}
              >
                <label className="block mb-2 font-semibold">Network</label>
                <NetworkSelector value={serviceID} onChange={setServiceID} networks={NETWORKS} />

                {detectedNetwork && serviceID && detectedNetwork !== serviceID && (
                  <div className="mb-3 text-sm text-orange-600 bg-orange-50 border border-orange-200 rounded-lg p-3">
                    ⚠️ Phone number looks like <strong>{detectedNetwork.toUpperCase()}</strong>, but you selected <strong>{serviceID.toUpperCase()}</strong>
                  </div>
                )}

                {recentPhones.length > 0 && (
                  <div className="mb-4">
                    <p className="font-semibold mb-2">Recent</p>
                    <div className="flex gap-2 overflow-x-auto">
                      {recentPhones.map((p) => (
                        <button key={p} onClick={() => setPhone(p)} className="px-4 py-2 bg-gray-100 rounded-full text-sm whitespace-nowrap">{p}</button>
                      ))}
                    </div>
                  </div>
                )}

                <label className="block mb-2 font-semibold">Phone Number</label>
                <input value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="numeric" placeholder="08012345678" className="w-full p-4 border rounded-xl mb-4 text-lg" />

                <div className="flex justify-end">
                  <button
                    onClick={() => setStep(1)}
                    disabled={!phone || !serviceID}
                    className="bg-[#39358c] text-white py-3 px-6 rounded-xl font-bold disabled:opacity-60 transition"
                  >
                    Next
                  </button>
                </div>
              </motion.div>
            )}

            {step === 1 && (
  <motion.div
    key="step2"
    initial={{ opacity: 0, x: 50 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -50 }}
    transition={{ duration: 0.25 }}
  >
    <label className="block mb-2 font-semibold">Amount (₦)</label>
    <input
      value={amount}
      onChange={(e) => setAmount(e.target.value)}
      inputMode="numeric"
      className="w-full p-4 border rounded-xl mb-4 text-lg"
    />

    {/* Animated Review Card */}
    <motion.div
      whileHover={{ scale: 1.03, boxShadow: "0 8px 20px rgba(0,0,0,0.12)" }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="flex items-center gap-4 p-4 mb-6 bg-white border rounded-xl shadow-sm cursor-pointer"
    >
      {selectedNetwork && (
        <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
          <Image src={selectedNetwork.icon} alt={selectedNetwork.label} width={28} height={28} />
        </div>
      )}
      <div className="flex-1">
        <h3 className="font-semibold mb-1">Review</h3>
        <p><span className="font-medium">Network:</span> {selectedNetwork?.label}</p>
        <p><span className="font-medium">Phone:</span> {phone}</p>
        <p><span className="font-medium">Amount:</span> ₦{amount}</p>
      </div>
    </motion.div>

    <div className="flex justify-between">
      <button
        onClick={() => setStep(0)}
        className="bg-gray-200 text-gray-700 py-3 px-6 rounded-xl font-bold transition"
      >
        Back
      </button>
      <button
        onClick={startPayment}
        disabled={!amount || !phone || !serviceID}
        className="bg-[#39358c] text-white py-3 px-6 rounded-xl font-bold disabled:opacity-60 transition"
      >
        Pay & Buy Airtime
      </button>
    </div>
  </motion.div>
)}

            {step === 2 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.25 }}
              >
                {!receipt ? (
                  <div className="text-center">
                    <p className="py-10">Confirming payment with Paystack…</p>
                    <button onClick={startPayment} disabled={loading} className="bg-[#39358c] text-white py-4 px-6 rounded-xl font-bold transition">
                      {loading ? "Processing…" : "Pay & Buy Airtime"}
                    </button>
                  </div>
                ) : (
                  <div className="bg-green-100 dark:bg-green-900 border border-green-200 dark:border-green-800 p-4 rounded">
                    <h2 className="text-xl font-bold mb-3">Airtime Successfully Purchased 🎉</h2>
                    <p><strong>Phone:</strong> {receipt.phone}</p>
                    <p><strong>Amount:</strong> ₦{receipt.amount}</p>
                    <p><strong>Network:</strong> {receipt.serviceID}</p>
                    <p><strong>Reference:</strong> {receipt.reference}</p>
                    <hr className="my-4" />
                    <button
                      className="w-full bg-[#39358c] active:scale-[0.98] disabled:opacity-60 text-white py-4 rounded-xl font-bold text-lg transition"
                      onClick={() => {
                        setStep(0);
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
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </BannersWrapper>
    </ResponsiveLandingWrapper>
  );
}
