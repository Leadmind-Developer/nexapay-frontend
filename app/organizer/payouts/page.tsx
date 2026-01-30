"use client";

import { useEffect, useState } from "react";

type Payout = {
  id: number;
  amount: number;
  reference: string;
  createdAt: string;
};

export default function OrganizerPayoutsPage() {
  const [balance, setBalance] = useState(0);
  const [pending, setPending] = useState(0);
  const [paidOut, setPaidOut] = useState(0);
  const [history, setHistory] = useState<Payout[]>([]);

  useEffect(() => {
    fetch("/api/payouts/organizer/payouts")
      .then(r => r.json())
      .then(data => {
        setBalance(data.balance);
        setPending(data.pending);
        setPaidOut(data.paidOut);
        setHistory(data.history);
      });
  }, []);

  return (
    <main className="max-w-6xl mx-auto px-6 py-8">

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
        <BalanceCard label="Available Balance" value={balance} highlight />
        <BalanceCard label="Pending Earnings" value={pending} />
        <BalanceCard label="Total Paid Out" value={paidOut} />
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-4">Payout History</h2>

        {history.length === 0 ? (
          <div className="border border-dashed rounded-xl p-10 text-center text-gray-500">
            No payouts yet
          </div>
        ) : (
          <div className="space-y-3">
            {history.map(p => (
              <div
                key={p.id}
                className="border rounded-xl p-4 flex justify-between"
              >
                <span>{p.reference}</span>
                <span className="font-semibold">
                  ₦{p.amount.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

function BalanceCard({ label, value, highlight }: any) {
  return (
    <div className={`rounded-xl border p-5 ${highlight ? "bg-black text-white" : "bg-white"}`}>
      <p className={`text-sm ${highlight ? "text-gray-300" : "text-gray-500"}`}>
        {label}
      </p>
      <p className="text-3xl font-bold mt-1">
        ₦{value.toLocaleString()}
      </p>
    </div>
  );
}
