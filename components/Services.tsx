"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { io, Socket } from "socket.io-client";

type ServiceType = "AIRTIME" | "DATA" | "CABLE" | "ELECTRICITY" | "EDUCATION";

interface Transaction {
  id: string;
  service: string;
  amount: number;
  status: string;
  date: string;
  provider: string;
}

interface Variation {
  name: string;
  code: string;
  price: number;
}

const SERVICE_CATEGORIES: {
  type: ServiceType;
  label: string;
  options: string[];
}[] = [
  { type: "AIRTIME", label: "Buy Phone Airtime", options: ["MTN", "GLO", "Airtel", "9Mobile"] },
  { type: "DATA", label: "Buy Internet Data", options: ["MTN", "GLO", "Airtel", "9Mobile", "SMILE"] },
  { type: "CABLE", label: "Pay TV Subscription", options: ["DSTV", "GOTV", "STARTIMES"] },
  { type: "ELECTRICITY", label: "Pay Electricity Bill", options: ["IKEDC", "EKEDC", "PHED", "AEDC", "KEDCO", "IBEDC", "JED", "KAEDCO"] },
  { type: "EDUCATION", label: "Buy Education PIN", options: ["WAEC", "JAMB", "NECO", "NABTEB"] },
];

export default function Services() {
  const [selectedService, setSelectedService] = useState<ServiceType>("AIRTIME");
  const [selectedOption, setSelectedOption] = useState<string>("");
  const [variations, setVariations] = useState<Variation[]>([]);
  const [selectedVariation, setSelectedVariation] = useState<string>("");
  const [formData, setFormData] = useState({ phone: "", amount: "", email: "" });
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [loadingVariations, setLoadingVariations] = useState(false);

  // Fetch recent transactions
  const fetchTransactions = async () => {
    try {
      const res = await fetch("/api/transactions/recent");
      const data = await res.json();
      setTransactions(data || []);
    } catch (err) {
      console.error("Failed to fetch transactions:", err);
    }
  };

  // Fetch variations dynamically for services that have them
  const fetchVariations = async () => {
    if (!selectedOption) return setVariations([]);
    setLoadingVariations(true);

    try {
      // Skip variations for Airtime
      if (selectedService === "AIRTIME") {
        setVariations([]);
        setSelectedVariation("");
        setLoadingVariations(false);
        return;
      }

      let url = "";
      switch (selectedService) {
        case "DATA":
          url = `/api/vtpass/data/variations/${selectedOption.toLowerCase()}`;
          break;
        case "CABLE":
          url = `/api/vtpass/cable/variations?service=${selectedOption}`;
          break;
        case "ELECTRICITY":
          setVariations([
            { name: "Prepaid", code: "prepaid", price: 0 },
            { name: "Postpaid", code: "postpaid", price: 0 },
          ]);
          setSelectedVariation("prepaid");
          setLoadingVariations(false);
          return;
        case "EDUCATION":
          url = `/api/vtpass/education/variations?serviceID=${selectedOption.toLowerCase()}`;
          break;
        default:
          setVariations([]);
          setLoadingVariations(false);
          return;
      }

      if (!url) return;

      const res = await fetch(url);
      const data = await res.json();

      let formatted: Variation[] = [];
      if (selectedService === "DATA" && data.success) {
        formatted = data.variations.map((v: any) => ({
          name: v.name,
          code: v.variation_code,
          price: v.variation_amount,
        }));
      } else if (selectedService === "CABLE") {
        formatted = data.variations?.map((v: any) => ({
          name: `${v.name} — ₦${v.amount}`,
          code: v.variation_code,
          price: v.amount,
        })) || [];
      } else if (selectedService === "EDUCATION") {
        formatted = data?.map((v: any) => ({
          name: v.name,
          code: v.variation_code,
          price: v.amount,
        })) || [];
      }

      setVariations(formatted);
      if (formatted.length > 0) {
        setSelectedVariation(formatted[0].code);
        setFormData({ ...formData, amount: formatted[0].price.toString() });
      }
    } catch (err) {
      console.error("Failed to fetch variations:", err);
      setVariations([]);
    } finally {
      setLoadingVariations(false);
    }
  };

  useEffect(() => {
    fetchVariations();
  }, [selectedOption, selectedService]);

  // Socket.IO setup
  useEffect(() => {
    const socketClient: Socket = io(process.env.NEXT_PUBLIC_API_URL || "https://nexapay-backend-138118361183.us-central1.run.app/api");
    setSocket(socketClient);
    socketClient.on("transaction:new", (tx: Transaction) => setTransactions((prev) => [tx, ...prev]));
    fetchTransactions();
    return () => {
      socketClient.disconnect();
    };
  }, []);

  // Main payment handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage("Processing...");

    // Airtime doesn't require selectedVariation
    if (selectedService !== "AIRTIME" && !selectedVariation) {
      setStatusMessage("⚠️ Please select a plan");
      return;
    }

    if (selectedService === "AIRTIME" && !formData.amount) {
      setStatusMessage("⚠️ Please enter amount");
      return;
    }

    try {
      const ref = `tx-${Date.now()}`;
      const initRes = await fetch("/api/paystack/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          amount: Number(formData.amount),
          reference: ref,
          metadata: {
            service: selectedService,
            option: selectedOption,
            phone: formData.phone,
            variationCode: selectedVariation,
          },
        }),
      });
      const initData = await initRes.json();
      if (!initRes.ok) throw new Error(initData.error || "Failed to initialize payment");

      const handler = (window as any).PaystackPop.setup({
        key: process.env.NEXT_PUBLIC_PAYSTACK_KEY,
        email: formData.email,
        amount: Number(formData.amount) * 100,
        ref,
        callback: async (response: any) => {
          setStatusMessage("Verifying payment...");
          const verifyRes = await fetch(`/api/paystack/verify/${response.reference}`);
          const verifyData = await verifyRes.json();

          if (verifyData.status !== "success") {
            setStatusMessage("❌ Payment failed!");
            return;
          }

          let purchaseUrl = "";
          let purchasePayload: any = {};

          switch (selectedService) {
            case "AIRTIME":
              purchaseUrl = "/api/vtpass/airtime/local";
              purchasePayload = {
                phone: formData.phone,
                amount: Number(formData.amount),
                serviceID: selectedOption,
              };
              break;
            case "DATA":
              purchaseUrl = "/api/vtpass/data/purchase";
              purchasePayload = {
                billersCode: formData.phone,
                variation_code: selectedVariation,
                amount: Number(formData.amount),
                provider: selectedOption.toLowerCase(),
              };
              break;
            case "CABLE":
              purchaseUrl = "/api/vtpass/cable/purchase";
              purchasePayload = {
                request_id: ref,
                service: selectedOption,
                smartcard: formData.phone,
                variation_code: selectedVariation,
                amount: Number(formData.amount),
              };
              break;
            case "ELECTRICITY":
              purchaseUrl = "/api/vtpass/electricity/purchase";
              purchasePayload = {
                request_id: ref,
                serviceID: selectedOption,
                billersCode: formData.phone,
                variation_code: selectedVariation,
                amount: Number(formData.amount),
              };
              break;
            case "EDUCATION":
              purchaseUrl = "/api/vtpass/education/purchase";
              purchasePayload = {
                request_id: ref,
                userId: verifyData.userId || 1,
                paymentId: verifyData.paymentId || 0,
                serviceID: selectedOption.toLowerCase(),
                billersCode: formData.phone,
                variation_code: selectedVariation,
              };
              break;
          }

          const purchaseRes = await fetch(purchaseUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(purchasePayload),
          });
          const purchaseData = await purchaseRes.json();

          if (purchaseRes.ok) {
            setStatusMessage("✅ Purchase successful!");
            setFormData({ phone: "", amount: "", email: "" });
            setSelectedOption("");
            setSelectedVariation("");
          } else {
            setStatusMessage(`❌ Purchase failed: ${purchaseData.error || "Unknown error"}`);
          }
        },
        onClose: () => setStatusMessage("Payment cancelled"),
      });
      handler.openIframe();
    } catch (err) {
      setStatusMessage(`⚠️ Error: ${(err as Error).message}`);
    }
  };

  // Form validation
  const isFormValid =
    formData.email &&
    formData.phone &&
    (selectedService === "AIRTIME" ? formData.amount : selectedVariation) &&
    !loadingVariations;

  return (
    <section className="py-20 bg-gray-50 text-center">
      <h2 className="text-3xl font-bold mb-6">Pay Bills & Buy Airtime/Data/Education</h2>

      {/* Service Categories */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-10 px-4">
        {SERVICE_CATEGORIES.map((s, idx) => (
          <motion.div
            key={s.type}
            onClick={() => {
              setSelectedService(s.type);
              setSelectedOption("");
              setVariations([]);
              setSelectedVariation("");
              setFormData({ phone: "", amount: "", email: "" });
            }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: idx * 0.05 }}
            className={`cursor-pointer p-4 w-full rounded-lg shadow-md transition transform hover:scale-105 ${
              selectedService === s.type ? "bg-indigo-600 text-white" : "bg-white text-gray-800"
            }`}
          >
            <h3 className="text-base font-semibold mb-1">{s.label}</h3>
            <ul className="text-xs space-y-0.5">
              {s.options.map((opt) => (
                <li
                  key={opt}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedService(s.type);
                    setSelectedOption(opt);

                    setFormData((prev) => ({
                      phone: "",
                      amount: s.type === "AIRTIME" ? prev.amount : "",
                      email: "",
                    }));
                    setVariations([]);
                    setSelectedVariation("");
                  }}
                  className={`py-1 px-2 rounded cursor-pointer transition ${
                    selectedOption === opt
                      ? "bg-indigo-800 text-white"
                      : "hover:bg-indigo-100 hover:text-indigo-700"
                  }`}
                >
                  {opt}
                </li>
              ))}
            </ul>
          </motion.div>
        ))}
      </div>

      {/* Payment Form */}
      {selectedOption && (
        <form
          onSubmit={handleSubmit}
          className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-lg mb-10 text-left"
        >
          <h3 className="text-xl font-semibold mb-4 text-center">
            {SERVICE_CATEGORIES.find((s) => s.type === selectedService)?.label}
            <br />
            <span className="text-indigo-600">{selectedOption}</span>
          </h3>

          <input
            type="email"
            placeholder="Email for payment"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full mb-4 p-2 border rounded"
            required
          />

          <input
            type="text"
            placeholder={
              selectedService === "ELECTRICITY"
                ? "Meter Number"
                : selectedService === "CABLE"
                ? "Smartcard Number"
                : selectedService === "EDUCATION"
                ? "Candidate Number / Registration"
                : "Phone Number"
            }
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="w-full mb-4 p-2 border rounded"
            required
          />

          {/* Show manual amount for Airtime */}
          {selectedService === "AIRTIME" && (
            <input
              type="number"
              placeholder="Amount"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              className="w-full mb-4 p-2 border rounded"
              required
            />
          )}

          {/* Show variations dropdown for other services */}
          {variations.length > 0 && (
            <select
              value={selectedVariation}
              onChange={(e) => {
                setSelectedVariation(e.target.value);
                const sel = variations.find((v) => v.code === e.target.value);
                if (sel) setFormData({ ...formData, amount: sel.price.toString() });
              }}
              className="w-full mb-4 p-2 border rounded"
              required
            >
              {variations.map((v) => (
                <option key={v.code} value={v.code}>
                  {v.name} {v.price ? `— ₦${v.price}` : ""}
                </option>
              ))}
            </select>
          )}

          <input type="hidden" value={formData.amount} />

          <button
            type="submit"
            className={`w-full py-2 px-4 rounded font-semibold transition ${
              isFormValid
                ? "bg-indigo-600 text-white hover:bg-indigo-700"
                : "bg-gray-400 text-gray-700 cursor-not-allowed"
            }`}
            disabled={!isFormValid}
          >
            {loadingVariations ? "Loading plans..." : "Pay Now"}
          </button>
        </form>
      )}

      {statusMessage && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={`mb-6 font-medium ${
            statusMessage.includes("✅")
              ? "text-green-600"
              : statusMessage.includes("❌")
              ? "text-red-600"
              : "text-yellow-600"
          }`}
        >
          {statusMessage}
        </motion.p>
      )}

      <div className="max-w-5xl mx-auto bg-white p-6 rounded-lg shadow-lg">
        <h3 className="text-2xl font-semibold mb-4">Recent Transactions</h3>
        {transactions.length === 0 ? (
          <p className="text-gray-500">No recent transactions found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-200">
              <thead>
                <tr className="bg-gray-100 text-left">
                  <th className="py-2 px-4">Service</th>
                  <th className="py-2 px-4">Provider</th>
                  <th className="py-2 px-4">Amount</th>
                  <th className="py-2 px-4">Status</th>
                  <th className="py-2 px-4">Date</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => (
                  <tr key={tx.id} className="border-t hover:bg-gray-50 transition">
                    <td className="py-2 px-4">{tx.service}</td>
                    <td className="py-2 px-4">{tx.provider}</td>
                    <td className="py-2 px-4">₦{tx.amount}</td>
                    <td
                      className={`py-2 px-4 font-semibold ${
                        tx.status === "SUCCESS"
                          ? "text-green-600"
                          : tx.status === "FAILED"
                          ? "text-red-600"
                          : "text-yellow-600"
                      }`}
                    >
                      {tx.status}
                    </td>
                    <td className="py-2 px-4">{new Date(tx.date).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
