"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { io, Socket } from "socket.io-client";

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
    type: "ELECTRICITY",
    label: "Pay Electricity Bill",
    options: ["PHED", "AEDC", "IKEDC", "EKEDC", "KEDCO", "IBEDC", "JEDplc", "KAEDCO"],
  },
  {
    type: "CABLE",
    label: "Pay TV Subscription",
    options: ["GOTV", "DSTV", "STARTIMES"],
  },
  {
    type: "INSURANCE",
    label: "Insurance Plans",
    options: [
      "Third Party Motor",
      "Health Insurance - HMO",
      "Home Cover",
      "Personal Accident",
    ],
  },
];

export default function Services() {
  const [selectedService, setSelectedService] = useState<ServiceType>("AIRTIME");
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

  // Setup Socket.IO
  useEffect(() => {
    const socketClient = io(process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080");
    setSocket(socketClient);

    socketClient.on("transaction:new", (tx: Transaction) => {
      setTransactions((prev) => [tx, ...prev]);
    });

    fetchTransactions();
    return () => socketClient.disconnect();
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
      } else {
        setStatusMessage(`❌ Failed: ${data?.message || "An error occurred"}`);
      }
    } catch (err) {
      setStatusMessage(`⚠️ Error: ${(err as Error).message}`);
    }
  };

  // Shared fade-up animation
  const fadeUp = {
    initial: { opacity: 0, y: 40 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6 },
  };

  return (
    <section className="py-20 bg-gray-50 dark:bg-gray-900 text-center transition-colors duration-300">
      <motion.h2
        {...fadeUp}
        className="text-3xl font-bold mb-10 text-gray-900 dark:text-white"
      >
        Pay Bills & Buy Airtime/Data
      </motion.h2>

      {/* Provider Toggle */}
      <motion.div
        {...fadeUp}
        className="flex justify-center gap-4 mb-12 flex-wrap"
      >
        {(["SmartCash", "VTpass"] as ProviderType[]).map((p) => (
          <button
            key={p}
            onClick={() => setProvider(p)}
            className={`px-6 py-2 rounded-full font-semibold transition-colors duration-200 ${
              provider === p
                ? "bg-indigo-600 text-white"
                : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 shadow"
            }`}
          >
            {p}
          </button>
        ))}
      </motion.div>

      {/* === Service Sections === */}
      {SERVICE_CATEGORIES.map((service, index) => (
        <motion.section
          id={service.type.toLowerCase()}
          key={service.type}
          {...fadeUp}
          transition={{ duration: 0.6, delay: index * 0.2 }}
          className="py-16 border-t border-gray-200 dark:border-gray-800"
        >
          <h3 className="text-2xl font-bold mb-8 text-gray-900 dark:text-white">
            {service.label}
          </h3>

          <div className="max-w-md mx-auto">
            <select
              value={selectedService === service.type ? selectedOption : ""}
              onChange={(e) => {
                setSelectedService(service.type);
                setSelectedOption(e.target.value);
              }}
              className="w-full mb-6 p-3 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-md shadow-sm text-gray-800 dark:text-gray-200"
            >
              <option value="">Select an option</option>
              {service.options.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>

            {selectedService === service.type && selectedOption && (
              <motion.form
                onSubmit={handleSubmit}
                {...fadeUp}
                transition={{ delay: 0.2 }}
                className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg text-left"
              >
                <h4 className="text-lg font-semibold mb-4 text-center text-indigo-600 dark:text-indigo-400">
                  {selectedOption}
                </h4>

                {/* Input Fields */}
                <input
                  type="text"
                  placeholder={
                    service.type === "ELECTRICITY"
                      ? "Meter Number"
                      : service.type === "CABLE"
                      ? "Smartcard Number"
                      : "Phone Number"
                  }
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className="w-full mb-4 p-2 border dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded"
                  required
                />

                {service.type === "DATA" && (
                  <input
                    type="text"
                    placeholder="Data Plan Code"
                    value={formData.planCode}
                    onChange={(e) =>
                      setFormData({ ...formData, planCode: e.target.value })
                    }
                    className="w-full mb-4 p-2 border dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded"
                  />
                )}

                <input
                  type="number"
                  placeholder="Amount (₦)"
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData({ ...formData, amount: e.target.value })
                  }
                  className="w-full mb-4 p-2 border dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded"
                  required
                  min="50"
                />

                <button
                  type="submit"
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded transition font-semibold"
                >
                  Pay Now
                </button>
              </motion.form>
            )}
          </div>
        </motion.section>
      ))}

      {/* Status Message */}
      {statusMessage && (
        <motion.p
          {...fadeUp}
          className={`mt-10 font-medium ${
            statusMessage.includes("✅")
              ? "text-green-600 dark:text-green-400"
              : statusMessage.includes("❌")
              ? "text-red-600 dark:text-red-400"
              : "text-yellow-600 dark:text-yellow-400"
          }`}
        >
          {statusMessage}
        </motion.p>
      )}

      {/* Recent Transactions */}
      <motion.div
        {...fadeUp}
        className="max-w-5xl mx-auto bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg mt-16 transition-colors"
      >
        <h3 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
          Recent Transactions
        </h3>
        {transactions.length === 0 ? (
          <p className="text-gray-600 dark:text-gray-400">No recent transactions found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-200 dark:border-gray-700">
              <thead>
                <tr className="bg-gray-100 dark:bg-gray-700 text-left text-gray-800 dark:text-gray-200">
                  <th className="py-2 px-4">Service</th>
                  <th className="py-2 px-4">Provider</th>
                  <th className="py-2 px-4">Amount</th>
                  <th className="py-2 px-4">Status</th>
                  <th className="py-2 px-4">Date</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => (
                  <tr
                    key={tx.id}
                    className="border-t dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900 transition"
                  >
                    <td className="py-2 px-4">{tx.service}</td>
                    <td className="py-2 px-4">{tx.provider}</td>
                    <td className="py-2 px-4">₦{tx.amount}</td>
                    <td
                      className={`py-2 px-4 font-semibold ${
                        tx.status === "SUCCESS"
                          ? "text-green-600 dark:text-green-400"
                          : tx.status === "FAILED"
                          ? "text-red-600 dark:text-red-400"
                          : "text-yellow-600 dark:text-yellow-400"
                      }`}
                    >
                      {tx.status}
                    </td>
                    <td className="py-2 px-4 text-gray-700 dark:text-gray-300">
                      {new Date(tx.date).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </section>
  );
}
