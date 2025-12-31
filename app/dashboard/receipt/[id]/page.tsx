"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import api from "@/lib/api";

export default function ReceiptPage() {
  const { id } = useParams();
  const [tx, setTx] = useState<any>(null);

  useEffect(() => {
    api.get(`/transactions/${id}`).then(res => {
      setTx(res.data.transaction);
    });
  }, [id]);

  if (!tx) {
    return <p className="p-6">Loading receipt…</p>;
  }

  return (
    <div className="max-w-md mx-auto p-6 space-y-4">
      <h1 className="text-xl font-bold">Transaction Receipt</h1>

      <div className="space-y-2 text-sm">
        <p><strong>Category:</strong> {tx.category}</p>
        <p><strong>Type:</strong> {tx.type}</p>
        <p><strong>Amount:</strong> ₦{tx.amount}</p>
        <p><strong>Date:</strong> {new Date(tx.createdAt).toDateString()}</p>
        <p className="break-all">
          <strong>Reference:</strong> {tx.reference}
        </p>
      </div>

      <button
        onClick={() => window.print()}
        className="w-full bg-blue-600 text-white py-2 rounded-lg"
      >
        Download Receipt
      </button>
    </div>
  );
}
