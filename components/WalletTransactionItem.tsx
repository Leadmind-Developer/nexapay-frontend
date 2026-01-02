"use client";

import React from "react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  AlertTriangle,
} from "lucide-react";

/* ================= TYPES ================= */

export type WalletTxType = "credit" | "debit";
export type WalletTxStatus = "success" | "pending" | "failed";

export interface WalletTransaction {
  id: number;
  type: WalletTxType | "CREDIT" | "DEBIT"; // legacy-safe
  amount: number;
  status?: WalletTxStatus;
  reference?: string;
  createdAt: string;
  metadata?: {
    externalBank?: {
      bankName: string;
      accountNumber: string;
    };
  };
}

type Props = {
  tx: WalletTransaction;
  onClick?: (tx: WalletTransaction) => void;
};

/* ================= COMPONENT ================= */

export default function WalletTransactionItem({ tx, onClick }: Props) {
  /* ================= NORMALIZATION ================= */
  const normalizedType: WalletTxType =
    String(tx.type).toLowerCase() === "credit" ? "credit" : "debit";

  const status: WalletTxStatus = tx.status ?? "success";
  const isCredit = normalizedType === "credit";

  /* ================= COLORS ================= */
  const amountColor =
    status === "failed"
      ? "text-red-600"
      : status === "pending"
      ? "text-yellow-600"
      : isCredit
      ? "text-green-600"
      : "text-red-600";

  const badgeClass =
    status === "failed"
      ? "bg-red-100 text-red-600"
      : status === "pending"
      ? "bg-yellow-100 text-yellow-600"
      : "bg-green-100 text-green-600";

  /* ================= ICON ================= */
  const Icon =
    status === "failed"
      ? AlertTriangle
      : isCredit
      ? ArrowDownLeft
      : ArrowUpRight;

  const iconBg =
    status === "failed"
      ? "bg-red-100 text-red-600"
      : isCredit
      ? "bg-green-100 text-green-600"
      : "bg-red-100 text-red-600";

  const amountText = `${isCredit ? "+" : "-"}₦${Math.abs(tx.amount).toLocaleString(
    "en-NG",
    { minimumFractionDigits: 2, maximumFractionDigits: 2 }
  )}`;

  return (
    <div
      onClick={() => onClick?.(tx)}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition p-4 flex items-center gap-3 cursor-pointer"
    >
      {/* Icon Avatar */}
      <div
        className={`w-10 h-10 rounded-full flex items-center justify-center ${iconBg}`}
      >
        <Icon size={18} />
      </div>

      {/* Info */}
      <div className="flex-1">
        <div className="flex justify-between items-center">
          <p className="font-semibold capitalize">
            {isCredit ? "Wallet Credit" : "Wallet Debit"}
          </p>

          <span
            className={`text-xs font-semibold px-2 py-0.5 rounded ${badgeClass}`}
          >
            {status}
          </span>
        </div>

        {tx.reference && (
          <p className="text-xs text-gray-500">Ref: {tx.reference}</p>
        )}

        <p className="text-xs text-gray-400">
          {new Date(tx.createdAt).toLocaleString()}
        </p>

        {tx.metadata?.externalBank && (
          <p className="text-xs text-gray-500 italic mt-1">
            {tx.metadata.externalBank.bankName} ••••
            {tx.metadata.externalBank.accountNumber.slice(-4)}
          </p>
        )}
      </div>

      {/* Amount */}
      <div className={`font-bold text-right ${amountColor}`}>
        {amountText}
      </div>
    </div>
  );
}
