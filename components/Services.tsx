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
    type: "CABLE",
    label: "Pay TV Subs",
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

  return (
    <section className="py-12 bg-gray-50 text-center px-4 sm:px-6 lg:px-8">
      <h2 className="text-2xl sm:text-3xl font-bold mb-6">Pay Bills & Buy Airtime/Data</h2>

      {/* Provider Toggle */}
      <div className="flex justify-center gap-3 flex-wrap mb-8">
        {(["SmartCash", "VTpass"] as ProviderType[]).map((p) => (
          <button
            key={p}
            onClick={() => setProvider(p)}
            className={`px-4 sm:px-6 py-2 rounded-full font-semibold w-full sm:w-auto transition ${
              provider === p ? "bg-indigo-600 text-white" : "bg-white text-gray-700 shadow"
            }`}
          >
            {p}
          </button>
        ))}
      </div>

      {/* Service Categories */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        {SERVICE_CATEGORIES.map((s, idx) => (
          <motion.div
            key={s.type}
            onClick={() => {
              setSelectedService(s.type);
              setSelectedOption("");
            }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: idx * 0.05 }}
            className={`cursor-pointer p-4 w-full rounded-lg shadow-md transition transform hover:scale-105 ${
              selectedService === s.type ? "bg-indigo-600 text-white" : "bg-white text-gray-800"
            }`}
          >
            <h3 className="text-base font-semibold mb-2">{s.label}</h3>
            <ul className="text-sm space-y-1 overflow-x-auto whitespace-nowrap">
              {s.options.map((opt) => (
                <li
                  key={opt}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedService(s.type);
                    setSelectedOption(opt);
                  }}
                  className={`inline-block py-1 px-3 rounded-full cursor-pointer transition ${
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

      {/* Dynamic Payment Form */}
      {selectedOption && (
        <form
          onSubmit={handleSubmit}
          className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-lg mb-8 text-left"
        >
          <h3 className="text-xl font-semibold mb-4 text-center">
            {SERVICE_CATEGORIES.find((s) => s.type === selectedService)?.label}
            <br />
            <span className="text-indigo-600">{selectedOption}</span>
          </h3>

          {(selectedService === "AIRTIME" ||
            selectedService === "DATA" ||
            selectedService === "ELECTRICITY" ||
            selectedService === "CABLE") && (
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
              className="w-full mb-4 p-3 border rounded focus:ring-2 focus:ring-indigo-400"
              required
            />
          )}

          {selectedService === "DATA" && (
            <input
              type="text"
              placeholder="Data Plan Code"
              value={formData.planCode}
              onChange={(e) => setFormData({ ...formData, planCode: e.target.value })}
              className="w-full mb-4 p-3 border rounded focus:ring-2 focus:ring-indigo-400"
            />
          )}

          <input
            type="number"
            placeholder="Amount (₦)"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            className="w-full mb-4 p-3 border rounded focus:ring-2 focus:ring-indigo-400"
            required
            min="50"
          />

          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-3 rounded hover:bg-indigo-700 transition font-semibold"
          >
            Pay Now
          </button>
        </form>
      )}

      {/* Status Message */}
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

      {/* Recent Transactions */}
      <div className="max-w-full sm:max-w-5xl mx-auto bg-white p-4 sm:p-6 rounded-lg shadow-lg overflow-x-auto">
        <h3 className="text-xl sm:text-2xl font-semibold mb-4">Recent Transactions</h3>
        {transactions.length === 0 ? (
          <p className="text-gray-500">No recent transactions found.</p>
        ) : (
          <table className="min-w-full border border-gray-200 text-sm sm:text-base">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="py-2 px-2 sm:px-4">Service</th>
                <th className="py-2 px-2 sm:px-4">Provider</th>
                <th className="py-2 px-2 sm:px-4">Amount</th>
                <th className="py-2 px-2 sm:px-4">Status</th>
                <th className="py-2 px-2 sm:px-4">Date</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => (
                <tr key={tx.id} className="border-t hover:bg-gray-50 transition">
                  <td className="py-2 px-2 sm:px-4">{tx.service}</td>
                  <td className="py-2 px-2 sm:px-4">{tx.provider}</td>
                  <td className="py-2 px-2 sm:px-4">₦{tx.amount}</td>
                  <td
                    className={`py-2 px-2 sm:px-4 font-semibold ${
                      tx.status === "SUCCESS"
                        ? "text-green-600"
                        : tx.status === "FAILED"
                        ? "text-red-600"
                        : "text-yellow-600"
                    }`}
                  >
                    {tx.status}
                  </td>
                  <td className="py-2 px-2 sm:px-4">{new Date(tx.date).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}
