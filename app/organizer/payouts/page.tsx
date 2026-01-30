"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function OrganizerPayoutsPage() {
  const [balance, setBalance] = useState(0);
  const [pending, setPending] = useState(0);
  const [paidOut, setPaidOut] = useState(0);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchPayouts() {
      try {
        setLoading(true);
        const res = await fetch("/api/organizer/payouts", {
          credentials: "include", // for cookies
        });
        if (!res.ok) throw new Error("Failed to fetch payouts");
        const data = await res.json();

        setBalance(data.balance || 0);
        setPending(data.pending?.length || 0);
        setPaidOut(data.paidOut || 0);
        setHistory(data.history || []);
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    }

    fetchPayouts();
  }, []);

  return (
    <main className="max-w-6xl mx-auto px-6 py-8">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Payouts</h1>
          <p className="text-gray-500 mt-1">
            View earnings and manage withdrawals.
          </p>
        </div>

        <Link
          href="/organizer/events"
          className="text-sm font-medium text-gray-600 hover:underline"
        >
          ← Back to dashboard
        </Link>
      </div>

      {/* BALANCE CARDS */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
        <BalanceCard label="Available Balance" value={balance} highlight />
        <BalanceCard label="Pending Earnings" value={pending} />
        <BalanceCard label="Total Paid Out" value={paidOut} />
      </section>

      {/* PAYOUT ACTION */}
      <section className="bg-white border rounded-xl p-6 mb-10">
        <h2 className="text-lg font-semibold mb-2">Withdraw Funds</h2>
        <p className="text-sm text-gray-500 mb-4">
          Withdrawals will be sent to your registered bank account.
        </p>

        <button
          disabled
          className="rounded-xl bg-black text-white px-6 py-3 font-medium opacity-40 cursor-not-allowed"
        >
          Withdraw (Coming soon)
        </button>
      </section>

      {/* PAYOUT HISTORY */}
      <section>
        <h2 className="text-lg font-semibold mb-4">Payout History</h2>

        {loading ? (
          <p className="text-gray-500 text-center">Loading...</p>
        ) : error ? (
          <p className="text-red-500 text-center">{error}</p>
        ) : history.length === 0 ? (
          <div className="border border-dashed rounded-xl p-10 text-center">
            <p className="text-gray-500">
              No payouts yet. Your completed payouts will appear here.
            </p>
          </div>
        ) : (
          <ul className="space-y-4">
            {history.map((h, i) => (
              <li
                key={i}
                className="border rounded-xl p-4 flex justify-between items-center"
              >
                <div>
                  <p className="font-medium">{h.type.replace("_", " ")}</p>
                  <p className="text-gray-500 text-sm">
                    {new Date(h.createdAt).toLocaleDateString()} | ₦
                    {h.amount.toLocaleString()}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}

/* ================= COMPONENTS ================= */

function BalanceCard({
  label,
  value,
  highlight,
}: {
  label: string;
  value: number;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border p-5 ${
        highlight ? "bg-black text-white" : "bg-white"
      }`}
    >
      <p
        className={`text-sm ${highlight ? "text-gray-300" : "text-gray-500"}`}
      >
        {label}
      </p>
      <p className="text-3xl font-bold mt-1">₦{value.toLocaleString()}</p>
    </div>
  );
}
