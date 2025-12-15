"use client";

import React from "react";

export interface WalletTransaction {
  id: number;
  type: string;
  amount: number;
  status?: "success" | "pending" | "failed";
  reference?: string;
  createdAt: string;
  metadata?: {
    senderAvatar?: string;
    receiverAvatar?: string;
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

export default function WalletTransactionItem({ tx, onClick }: Props) {
  const isCredit = tx.amount >= 0;

  const color =
    tx.status === "failed"
      ? "#D93030"
      : tx.status === "pending"
      ? "#F5A623"
      : isCredit
      ? "#12C060"
      : "#E84E4E";

  const amountText = `${isCredit ? "+" : "-"}₦${Math.abs(tx.amount).toLocaleString(
    "en-NG",
    { minimumFractionDigits: 2, maximumFractionDigits: 2 }
  )}`;

  return (
    <div
      onClick={() => onClick?.(tx)}
      className="bg-white rounded-xl shadow p-4 flex items-center gap-3 cursor-pointer"
    >
      {/* Avatar */}
      <img
        src={
          tx.metadata?.senderAvatar ||
          tx.metadata?.receiverAvatar ||
          "https://i.pravatar.cc/80?img=12"
        }
        alt="avatar"
        className="w-10 h-10 rounded-full"
      />

      {/* Info */}
      <div className="flex-1">
        <div className="flex justify-between items-center">
          <p className="font-semibold capitalize">{tx.type}</p>
          <span
            className={`text-xs font-bold px-2 py-0.5 rounded ${
              tx.status === "failed"
                ? "bg-red-100 text-red-600"
                : tx.status === "pending"
                ? "bg-yellow-100 text-yellow-600"
                : "bg-green-100 text-green-600"
            }`}
          >
            {tx.status ?? "success"}
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
      <div className="font-bold text-right" style={{ color }}>
        {amountText}
      </div>
    </div>
  );
}
