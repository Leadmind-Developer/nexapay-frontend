"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { io, Socket } from "socket.io-client";
import { useRouter } from "next/navigation";

type ServiceItem = {
  label: string;
  description: string;
  href: string;
};

interface Transaction {
  id: string;
  service: string;
  amount: number;
  status: string;
  date: string;
  provider: string;
}

const SERVICES: ServiceItem[] = [
  {
    label: "Airtime",
    description: "Buy local mobile airtime",
    href: "/airtime",
  },
  {
    label: "International Airtime",
    description: "Send airtime abroad",
    href: "/IntAirtime",
  },
  {
    label: "Data",
    description: "Buy internet data bundles",
    href: "/data",
  },
  {
    label: "Electricity",
    description: "Pay electricity bills",
    href: "/electricity",
  },
  {
    label: "Cable TV",
    description: "DSTV, GOTV & Startimes",
    href: "/cable",
  },
  {
    label: "Insurance",
    description: "Motor, health & personal cover",
    href: "/insurance",
  },
  {
    label: "Education",
    description: "School & exam payments",
    href: "/education",
  },
];

export default function Services() {
  const router = useRouter();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);

  /** Fetch recent transactions */
  const fetchTransactions = async () => {
    try {
      const res = await fetch("/api/transactions/recent");
      const data = await res.json();
      setTransactions(data || []);
    } catch (err) {
      console.error("Failed to fetch transactions:", err);
    }
  };

  /** Socket setup */
  useEffect(() => {
    const socketClient = io(
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"
    );

    setSocket(socketClient);

    socketClient.on("transaction:new", (tx: Transaction) => {
      setTransactions((prev) => [tx, ...prev]);
    });

    fetchTransactions();

    return () => {
      socketClient.disconnect();
    };
  }, []);

  /** Animation */
  const fadeUp = {
    initial: { opacity: 0, y: 40 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6 },
  };

  return (
    <section className="py-20 bg-gray-50 dark:bg-gray-900 transition-colors">
      <motion.h2
        {...fadeUp}
        className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-white"
      >
        Services
      </motion.h2>

      {/* === SERVICES GRID === */}
      <div className="max-w-6xl mx-auto grid gap-6 sm:grid-cols-2 lg:grid-cols-3 px-4">
        {SERVICES.map((service, index) => (
          <motion.div
            key={service.label}
            {...fadeUp}
            transition={{ delay: index * 0.1 }}
            onClick={() => router.push(service.href)}
            className="cursor-pointer bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md hover:shadow-lg hover:-translate-y-1 transition-all"
          >
            <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
              {service.label}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {service.description}
            </p>
          </motion.div>
        ))}
      </div>

      {/* === RECENT TRANSACTIONS === */}
      <motion.div
        {...fadeUp}
        className="max-w-5xl mx-auto bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg mt-20 transition-colors"
      >
        <h3 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
          Recent Transactions
        </h3>

        {transactions.length === 0 ? (
          <p className="text-gray-600 dark:text-gray-400">
            No recent transactions found.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-200 dark:border-gray-700">
              <thead>
                <tr className="bg-gray-100 dark:bg-gray-700 text-left text-gray-800 dark:text-gray-200">
                  <th className="py-2 px-4">Service</th>
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
