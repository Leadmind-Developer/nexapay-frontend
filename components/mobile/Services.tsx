"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { io, Socket } from "socket.io-client";
import { useTheme } from "next-themes"; // 👈 For theme awareness

type ServiceType = "AIRTIME" | "DATA" | "CABLE" | "ELECTRICITY" | "INSURANCE";
type ProviderType = "SmartCash" | "VTpass";

interface Transaction {
  id: string;
  service: string;
  amount: number;
  status: string;
  date: string;
  provider: string;
}

const SERVICE_CATEGORIES: {
  type: ServiceType;
  label: string;
  options: string[];
}[] = [
  {
    type: "AIRTIME",
    label: "Buy Phone Airtime",
    options: ["MTN VTU", "GLO VTU", "Airtel VTU", "9Mobile VTU"],
  },
  {
    type: "DATA",
    label: "Buy Internet Data",
    options: ["MTN DATA", "GLO DATA", "AIRTEL DATA", "9MOBILE DATA", "SMILE DATA"],
  },
  {
    type: "CABLE",
    label: "Pay TV Subscription",
    options: ["GOTV", "DSTV", "STARTIMES"],
  },
  {
    type: "ELECTRICITY",
    label: "Pay Electricity Bill",
    options: ["PHED", "AEDC", "IKEDC", "EKEDC", "KEDCO", "IBEDC", "JEDplc", "KAEDCO"],
  },
  {
    type: "INSURANCE",
    label: "Insurance",
    options: [
      "Third Party Motor",
      "Health Insurance - HMO",
      "Home Cover",
      "Personal Accident",
    ],
  },
];

export default function Services() {
  const { theme } = useTheme(); // 👈 Detect theme
  const isDark = theme === "dark";

  const [selectedService, setSelectedService] = useState<ServiceType>("AIRTIME");
  const [selectedOption, setSelectedOption] = useState<string>("");
  const [provider, setProvider] = useState<ProviderType>("SmartCash");
  const [formData, setFormData] = useState({ phone: "", amount: "", planCode: "" });
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);

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

  // Setup live socket updates
  useEffect(() => {
    const socketClient = io(process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080");
    setSocket(socketClient);

    socketClient.on("transaction:new", (tx: Transaction) => {
      setTransactions((prev) => [tx, ...prev]);
    });

    fetchTransactions();
    return () => socketClient.disconnect();
  }, []);

  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage("Processing...");

    try {
      const res = await fetch(`/api/${provider.toLowerCase()}/pay`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          service: selectedService,
          option: selectedOption,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setStatusMessage(`✅ Payment successful! Ref: ${data?.transactionId || "N/A"}`);
        setFormData({ phone: "", amount: "", planCode: "" });
        setSelectedOption("");
        fetchTransactions();
      } else {
        setStatusMessage(`❌ Failed: ${data?.message || "An error occurred"}`);
      }
    } catch (err) {
      setStatusMessage(`⚠️ Error: ${(err as Error).message}`);
    }
  };

  return (
    <section
      className={`min-h-screen py-16 px-4 transition-colors duration-300 ${
        isDark ? "bg-gray-950 text-gray-100" : "bg-gray-50 text-gray-900"
      }`}
    >
      <h2 className="text-2xl sm:text-3xl font-bold text-center mb-6">
        Pay Bills & Buy Airtime/Data
      </h2>

      {/* Provider Toggle */}
      <div className="flex justify-center gap-3 mb-8">
        {(["SmartCash", "VTpass"] as ProviderType[]).map((p) => (
          <button
            key={p}
            onClick={() => setProvider(p)}
            className={`px-5 py-2 rounded-full text-sm sm:text-base font-medium transition-all ${
              provider === p
                ? "bg-indigo-600 text-white shadow-md"
                : isDark
                ? "bg-gray-800 text-gray-300"
                : "bg-white text-gray-700 border"
            }`}
          >
            {p}
          </button>
        ))}
      </div>

      {/* Service Dropdown */}
      <div className="max-w-sm mx-auto mb-6">
        <label htmlFor="service" className="block text-sm font-semibold mb-2">
          Select Service
        </label>
        <select
          id="service"
          value={selectedService}
          onChange={(e) => {
            setSelectedService(e.target.value as ServiceType);
            setSelectedOption("");
          }}
          className={`w-full p-3 rounded-md border text-sm ${
            isDark
              ? "bg-gray-900 border-gray-700 text-gray-200"
              : "bg-white border-gray-300 text-gray-800"
          }`}
        >
          {SERVICE_CATEGORIES.map((s) => (
            <option key={s.type} value={s.type}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      {/* Option Dropdown */}
      <div className="max-w-sm mx-auto mb-6">
        <label htmlFor="option" className="block text-sm font-semibold mb-2">
          Select Option
        </label>
        <select
          id="option"
          value={selectedOption}
          onChange={(e) => setSelectedOption(e.target.value)}
          className={`w-full p-3 rounded-md border text-sm ${
            isDark
              ? "bg-gray-900 border-gray-700 text-gray-200"
              : "bg-white border-gray-300 text-gray-800"
          }`}
        >
          <option value="">-- Choose Option --</option>
          {SERVICE_CATEGORIES.find((s) => s.type === selectedService)?.options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </div>

      {/* Dynamic Payment Form */}
      {selectedOption && (
        <motion.form
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSubmit}
          className={`max-w-sm mx-auto rounded-lg p-5 shadow-lg mb-10 ${
            isDark ? "bg-gray-900 border border-gray-800" : "bg-white border border-gray-200"
          }`}
        >
          <h3 className="text-lg font-semibold mb-4 text-center">
            {selectedOption} ({provider})
          </h3>

          {/* Dynamic Inputs */}
          <input
            type="tel"
            placeholder={
              selectedService === "ELECTRICITY"
                ? "Meter Number"
                : selectedService === "CABLE"
                ? "Smartcard Number"
                : "Phone Number"
            }
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className={`w-full mb-3 p-3 rounded border text-sm ${
              isDark
                ? "bg-gray-800 border-gray-700 text-gray-200"
                : "bg-gray-50 border-gray-300 text-gray-800"
            }`}
            required
          />

          {selectedService === "DATA" && (
            <input
              type="text"
              placeholder="Data Plan Code"
              value={formData.planCode}
              onChange={(e) => setFormData({ ...formData, planCode: e.target.value })}
              className={`w-full mb-3 p-3 rounded border text-sm ${
                isDark
                  ? "bg-gray-800 border-gray-700 text-gray-200"
                  : "bg-gray-50 border-gray-300 text-gray-800"
              }`}
            />
          )}

          <input
            type="number"
            placeholder="Amount (₦)"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            className={`w-full mb-4 p-3 rounded border text-sm ${
              isDark
                ? "bg-gray-800 border-gray-700 text-gray-200"
                : "bg-gray-50 border-gray-300 text-gray-800"
            }`}
            required
            min={50}
          />

          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded font-semibold transition"
          >
            Pay Now
          </button>
        </motion.form>
      )}

      {/* Status Message */}
      {statusMessage && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={`text-center mb-8 text-sm font-medium ${
            statusMessage.includes("✅")
              ? "text-green-500"
              : statusMessage.includes("❌")
              ? "text-red-500"
              : "text-yellow-500"
          }`}
        >
          {statusMessage}
        </motion.p>
      )}

      {/* Recent Transactions */}
      <div
        className={`max-w-lg mx-auto rounded-lg p-5 shadow-lg mb-10 ${
          isDark ? "bg-gray-900 border border-gray-800" : "bg-white border border-gray-200"
        }`}
      >
        <h3 className="text-lg font-semibold mb-4">Recent Transactions</h3>
        {transactions.length === 0 ? (
          <p className="text-gray-500 text-sm">No recent transactions yet.</p>
        ) : (
          <div className="space-y-3 max-h-[300px] overflow-y-auto">
            {transactions.map((tx) => (
              <div
                key={tx.id}
                className={`flex justify-between items-center p-3 rounded-md text-sm ${
                  isDark ? "bg-gray-800" : "bg-gray-50"
                }`}
              >
                <div>
                  <p className="font-medium">{tx.service}</p>
                  <p className="text-xs text-gray-400">{tx.provider}</p>
                </div>
                <div className="text-right">
                  <p>₦{tx.amount}</p>
                  <p
                    className={`text-xs font-semibold ${
                      tx.status === "SUCCESS"
                        ? "text-green-500"
                        : tx.status === "FAILED"
                        ? "text-red-500"
                        : "text-yellow-500"
                    }`}
                  >
                    {tx.status}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
