"use client";
import useSWR from "swr";
import { motion } from "framer-motion";
import SEO from "@/components/SEO";
import TransactionCard from "@/components/TransactionCard";
import { useTransactionsSocket } from "@/hooks/useTransactionsSocket";
import { TransactionsAPI } from "@/lib/api";
import DashboardLayout from "@/components/DashboardLayout";

interface Transaction {
  id?: string;
  reference_id?: string;
  amount: number;
  type: string;
  status: string;
  createdAt?: string;
  [key: string]: any;
}

const fetcher = async (): Promise<Transaction[]> => {
  // 👇 Explicitly type the Axios call so res.data is known
  const res = await TransactionsAPI.list<Transaction[]>();
  return res.data;
};

export default function DashboardPage() {
  useTransactionsSocket(); // Real-time updates

  const { data, error, isLoading } = useSWR<Transaction[]>("/transactions", fetcher);

  return (
    <DashboardLayout>
      <SEO title="Dashboard - NexaApp" description="Your recent transactions" />

      <div className="p-6 space-y-6">
        <header className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Dashboard
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Real-time transaction updates
          </p>
        </header>

        {error && (
          <div className="text-red-600 bg-red-50 border border-red-200 p-3 rounded-md">
            Failed to load transactions
          </div>
        )}

        {isLoading && (
          <div className="text-gray-500 animate-pulse">Loading transactions...</div>
        )}

        {Array.isArray(data) && (
          <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {data.length === 0 ? (
              <div className="text-gray-500">No transactions yet.</div>
            ) : (
              data.map((tx, i) => (
                <motion.div
                  key={tx.id ?? tx.reference_id ?? crypto.randomUUID()}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <TransactionCard tx={tx} />
                </motion.div>
              ))
            )}
          </section>
        )}
      </div>
    </DashboardLayout>
  );
}
