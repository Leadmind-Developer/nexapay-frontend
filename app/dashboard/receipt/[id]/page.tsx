"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import api from "@/lib/api";

import {
  formatDate,
  getCategoryLabel,
  normalizeStatus,
  receiptText,
} from "@/lib/transactionHelpers";

import jsPDF from "jspdf";

/* ================= TYPES ================= */

interface Transaction {
  id: number;
  type: "credit" | "debit";
  amount: number;
  reference?: string | null;
  createdAt: string;
  category?: string;
  narration?: string;
  status?: string;
  transactionStatus?: string;
}

/* ================= PAGE ================= */

export default function ReceiptPage() {
  const { id } = useParams();
  const [tx, setTx] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/transactions/${id}`)
      .then(res => {
        setTx(res.data.transaction);
      })
      .finally(() => setLoading(false));
  }, [id]);

  /* ================= PDF ================= */

  const downloadPDF = () => {
    if (!tx) return;

    const doc = new jsPDF();

    // Logo
    doc.addImage("/logo.png", "PNG", 15, 10, 40, 20);

    // Header
    doc.setFontSize(16);
    doc.text("Transaction Receipt", 105, 40, { align: "center" });

    doc.setFontSize(11);
    doc.text(`Status: ${normalizeStatus(tx).toUpperCase()}`, 15, 55);
    doc.text(`Date: ${formatDate(tx.createdAt)}`, 15, 63);

    // Divider
    doc.line(15, 68, 195, 68);

    // Content
    const rows = [
      ["Category", getCategoryLabel(tx)],
      ["Type", tx.type.toUpperCase()],
      ["Amount", `₦${tx.amount.toLocaleString()}`],
      ["Reference", tx.reference || "N/A"],
    ];

    let y = 78;
    rows.forEach(([label, value]) => {
      doc.text(`${label}:`, 15, y);
      doc.text(String(value), 70, y);
      y += 10;
    });

    // Footer
    doc.setFontSize(9);
    doc.text(
      "This receipt was generated electronically and is valid without signature.",
      105,
      280,
      { align: "center" }
    );

    doc.save(`receipt-${tx.id}.pdf`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh] text-gray-400">
        Loading receipt…
      </div>
    );
  }

  if (!tx) {
    return (
      <div className="p-6 text-center text-red-500">
        Receipt not found
      </div>
    );
  }

  const status = normalizeStatus(tx);

  return (
    <div className="max-w-md mx-auto p-6 space-y-6">
      {/* HEADER */}
      <div className="flex justify-center">
        <Image src="/logo.png" alt="Logo" width={120} height={40} />
      </div>

      <h1 className="text-xl font-bold text-center">
        Transaction Receipt
      </h1>

      {/* RECEIPT CARD */}
      <div className="bg-white dark:bg-gray-900 rounded-xl p-4 space-y-2 shadow">
        <p className="text-sm">
          <b>Status:</b>{" "}
          <span
            className={`capitalize ${
              status === "successful"
                ? "text-green-600"
                : status === "failed"
                ? "text-red-600"
                : "text-yellow-600"
            }`}
          >
            {status}
          </span>
        </p>

        <p className="text-sm"><b>Category:</b> {getCategoryLabel(tx)}</p>
        <p className="text-sm"><b>Type:</b> {tx.type}</p>
        <p className="text-sm"><b>Amount:</b> ₦{tx.amount.toLocaleString()}</p>
        <p className="text-sm"><b>Date:</b> {formatDate(tx.createdAt)}</p>

        <p className="text-sm break-all">
          <b>Reference:</b> {tx.reference || "N/A"}
        </p>
      </div>

      {/* ACTIONS */}
      <div className="space-y-3">
        <button
          onClick={downloadPDF}
          className="w-full bg-blue-600 text-white py-2 rounded-lg"
        >
          Download PDF Receipt
        </button>

        <button
          onClick={() => window.print()}
          className="w-full bg-gray-200 dark:bg-gray-700 py-2 rounded-lg"
        >
          Print Receipt
        </button>
      </div>
    </div>
  );
}
