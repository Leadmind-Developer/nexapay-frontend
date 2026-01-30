"use client";

import { useEffect, useState } from "react";

export default function AdminPayoutsPage() {
  const [pending, setPending] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/payouts/admin/payouts/pending")
      .then(r => r.json())
      .then(setPending);
  }, []);

  async function approve(payout:any) {
    await fetch("/api/payouts/admin/payouts/execute", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "EVENT_PAYOUT",
        referenceId: payout.referenceId,
        userId: payout.userId,
      }),
    });

    setPending(p => p.filter(x => x.id !== payout.id));
  }

  return (
    <main className="max-w-5xl mx-auto px-6 py-8">
      <h1 className="text-2xl font-bold mb-6">Pending Payouts</h1>

      {pending.length === 0 && (
        <p className="text-gray-500">No pending payouts</p>
      )}

      <div className="space-y-4">
        {pending.map(p => (
          <div key={p.id} className="border rounded-xl p-5 flex justify-between">
            <div>
              <p className="font-medium">Event: {p.referenceId}</p>
              <p className="text-sm text-gray-500">
                Organizer: {p.userId}
              </p>
            </div>

            <button
              onClick={() => approve(p)}
              className="bg-black text-white px-5 py-2 rounded-xl"
            >
              Approve & Pay
            </button>
          </div>
        ))}
      </div>
    </main>
  );
}
