"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function TransactionHistory({ userId }: { userId: string }) {
  const [transactions, setTransactions] = useState<any[]>([]);

  useEffect(() => {
    async function fetchHistory() {
      try {
        const res = await fetch(`/api/transactions?userId=${userId}`);
        const data = await res.json();
        setTransactions(data);
      } catch (err) {
        console.error(err);
      }
    }
    fetchHistory();
  }, [userId]);

  return (
    <section className="py-20 bg-gray-100 max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold text-center mb-6">Transaction History</h2>
      <div className="space-y-4">
        {transactions.map((tx) => (
          <motion.div
            key={tx.id}
            className="p-4 bg-white shadow rounded-lg flex justify-between"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span>{tx.service} - {tx.amount} NGN</span>
            <span className={`font-semibold ${tx.status === "SUCCESS" ? "text-green-600" : "text-red-600"}`}>
              {tx.status}
            </span>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
