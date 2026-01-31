"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import api from "@/lib/api";

export default function TransactionDetails() {
  const { reference } = useParams();
  const [txn, setTxn] = useState<any>(null);

  useEffect(() => {
    api.get(`/transactions/${reference}`).then(res => setTxn(res.data));
  }, [reference]);

  if (!txn) return <p className="p-6">Loading…</p>;

  function copy(text: string) {
    navigator.clipboard.writeText(text);
  }

  return (
    <div className="max-w-xl mx-auto p-6">
      <h2 className="text-xl font-bold mb-4 capitalize">
        {txn.service.replace("_", " ")} Receipt
      </h2>

      <p className="text-sm text-gray-500 mb-2">
        Reference: {txn.reference}
        <button onClick={() => copy(txn.reference)} className="ml-2 text-blue-600">
          Copy
        </button>
      </p>

      <p className="mb-4">
        Amount: <b>₦{txn.amount}</b>
      </p>

      {/* ================= TOKEN / PIN ================= */}
      {txn.meta?.token && (
        <div className="bg-green-100 p-4 rounded text-center mb-4">
          <p className="text-sm mb-2">Electricity Token</p>
          <p className="text-2xl font-bold tracking-widest">{txn.meta.token}</p>
          <button onClick={() => copy(txn.meta.token)} className="mt-2 text-blue-600">
            Copy Token
          </button>
        </div>
      )}

      {txn.meta?.pin && (
        <div className="bg-green-100 p-4 rounded text-center mb-4">
          <p className="text-sm mb-2">Education PIN</p>
          <p className="text-2xl font-bold tracking-widest">{txn.meta.pin}</p>
          <button onClick={() => copy(txn.meta.pin)} className="mt-2 text-blue-600">
            Copy PIN
          </button>
        </div>
      )}

      {/* ================= RECEIPT ================= */}
      <button
        onClick={() => window.print()}
        className="w-full bg-gray-900 text-white py-3 rounded"
      >
        Download Receipt
      </button>
    </div>
  );
}
