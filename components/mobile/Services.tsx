"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { io, Socket } from "socket.io-client";
import { Smartphone, Zap, Tv, PlugZap, ShieldCheck } from "lucide-react";

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
  icon: JSX.Element;
  options: string[];
}[] = [
  {
    type: "AIRTIME",
    label: "Buy Phone Airtime",
    icon: <Smartphone className="w-5 h-5" />,
    options: ["MTN VTU", "GLO VTU", "Airtel VTU", "9Mobile VTU"],
  },
  {
    type: "DATA",
    label: "Buy Internet Data",
    icon: <Zap className="w-5 h-5" />,
    options: ["MTN DATA", "GLO DATA", "AIRTEL DATA", "9MOBILE DATA", "SMILE DATA"],
  },
  {
    type: "CABLE",
    label: "Pay TV Subscription",
    icon: <Tv className="w-5 h-5" />,
    options: ["GOTV", "DSTV", "STARTIMES"],
  },
  {
    type: "ELECTRICITY",
    label: "Pay Electricity Bill",
    icon: <PlugZap className="w-5 h-5" />,
    options: ["PHED", "AEDC", "IKEDC", "EKEDC", "KEDCO", "IBEDC", "JEDplc", "KAEDCO"],
  },
  {
    type: "INSURANCE",
    label: "Insurance",
    icon: <ShieldCheck className="w-5 h-5" />,
    options: [
      "Third Party Motor",
      "Health Insurance - HMO",
      "Home Cover",
      "Personal Accident",
    ],
  },
];

export default function Services() {
  const [selectedService, setSelectedService] = useState<ServiceType | null>(null);
  const [selectedOption, setSelectedOption] = useState<string>("");
  const [provider, setProvider] = useState<ProviderType>("SmartCash");
  const [formData, setFormData] = useState({ phone: "", amount: "", planCode: "" });
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);

  // Fetch transactions
  const fetchTransactions = async () => {
    try {
      const res = await fetch("/api/transactions/recent");
      const data = await res.json();
      setTransactions(data || []);
    } catch (err) {
      console.error("Failed to fetch transactions:", err);
    }
  };

  // Setup Socket.IO for live updates
  useEffect(() => {
    const socketClient = io(process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080");
    setSocket(socketClient);

    socketClient.on("transaction:new", (tx: Transaction) => {
      setTransactions((prev) => [tx, ...prev]);
    });

    fetchTransactions();

    return () => {
      socketClient.disconnect();
    };
  }, []);

  // Submit handler
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
        setSelectedService(null);
      } else {
        setStatusMessage(`❌ Failed: ${data?.message || "An error occurred"}`);
      }
    } catch (err) {
      setStatusMessage(`⚠️ Error: ${(err as Error).message}`);
    }
  };

  return (
    <section
      className="min-h-screen pt-[calc(var(--header-height)+1rem)] pb-16 px-5
                 bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100"
    >
      {/* Title */}
      <h2 className="text-2xl font-extrabold text-center mb-6">
        Pay Bills & Buy Airtime/Data
      </h2>

      {/* Provider Toggle */}
      <div className="flex justify-center gap-3 mb-8">
        {(["SmartCash", "VTpass"] as ProviderType[]).map((p) => (
          <button
            key={p}
            onClick={() => setProvider(p)}
            className={`px-5 py-2 rounded-full text-sm font-semibold transition-all
              ${
                provider === p
                  ? "bg-indigo-600 text-white shadow-lg"
                  : "bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200"
              }`}
          >
            {p}
          </button>
        ))}
      </div>

      {/* Step 1: Choose Service */}
      {!selectedService && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 gap-4 sm:grid-cols-3"
        >
          {SERVICE_CATEGORIES.map((s) => (
            <button
              key={s.type}
              onClick={() => setSelectedService(s.type)}
              className="flex flex-col items-center justify-center bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 shadow-sm hover:shadow-md transition"
            >
              <div className="text-indigo-600 dark:text-yellow-400 mb-2">{s.icon}</div>
              <span className="text-sm font-semibold text-center">{s.label}</span>
            </button>
          ))}
        </motion.div>
      )}

      {/* Step 2: Choose Option */}
      <AnimatePresence>
        {selectedService && !selectedOption && (
          <motion.div
            key="options"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="mt-8"
          >
            <h3 className="text-lg font-semibold mb-3 text-center">
              Select Option for{" "}
              <span className="text-indigo-600 dark:text-yellow-400">
                {
                  SERVICE_CATEGORIES.find((s) => s.type === selectedService)
                    ?.label
                }
              </span>
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {SERVICE_CATEGORIES.find((s) => s.type === selectedService)?.options.map(
                (opt) => (
                  <button
                    key={opt}
                    onClick={() => setSelectedOption(opt)}
                    className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg py-3 px-2 text-sm font-medium hover:bg-indigo-50 dark:hover:bg-gray-800 transition"
                  >
                    {opt}
                  </button>
                )
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Step 3: Payment Form */}
      <AnimatePresence>
        {selectedOption && (
          <motion.form
            key="form"
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="mt-8 bg-white dark:bg-gray-900 p-5 rounded-xl shadow-lg max-w-md mx-auto"
          >
            <h3 className="text-lg font-bold text-center mb-4">
              {selectedOption}
            </h3>

            {/* Input fields */}
            {(selectedService === "AIRTIME" ||
              selectedService === "DATA" ||
              selectedService === "CABLE" ||
              selectedService === "ELECTRICITY") && (
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
                className="w-full mb-4 p-3 border rounded-md bg-gray-50 dark:bg-gray-800 dark:border-gray-700"
                required
              />
            )}

            {selectedService === "DATA" && (
              <input
                type="text"
                placeholder="Data Plan Code"
                value={formData.planCode}
                onChange={(e) => setFormData({ ...formData, planCode: e.target.value })}
                className="w-full mb-4 p-3 border rounded-md bg-gray-50 dark:bg-gray-800 dark:border-gray-700"
              />
            )}

            <input
              type="number"
              placeholder="Amount (₦)"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              className="w-full mb-4 p-3 border rounded-md bg-gray-50 dark:bg-gray-800 dark:border-gray-700"
              required
              min="50"
            />

            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-md transition"
            >
              Pay Now
            </button>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Status Message */}
      <AnimatePresence>
        {statusMessage && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`mt-6 font-medium text-center ${
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
      </AnimatePresence>

      {/* Recent Transactions */}
      <div className="mt-10 bg-white dark:bg-gray-900 rounded-xl p-5 shadow-lg">
        <h3 className="text-lg font-semibold mb-3">Recent Transactions</h3>
        {transactions.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            No recent transactions found.
          </p>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-800">
            {transactions.slice(0, 5).map((tx) => (
              <div
                key={tx.id}
                className="py-3 flex justify-between text-sm"
              >
                <div>
                  <p className="font-semibold">{tx.service}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(tx.date).toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold">₦{tx.amount}</p>
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
