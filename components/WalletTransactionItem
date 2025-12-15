// components/WalletTransactionItemWeb.tsx
import React from "react";
import { WalletTransaction } from "../screens/WalletHistoryScreen";

type Props = {
  tx: WalletTransaction;
  onClick?: (tx: WalletTransaction) => void;
};

export default function WalletTransactionItemWeb({ tx, onClick }: Props) {
  const isCredit = tx.type === "credit";
  const isWithdrawal = tx.type === "withdrawalRequest";

  const color = isCredit
    ? "#12C060"
    : isWithdrawal
    ? "#F5A623"
    : "#E84E4E";

  const title = isCredit
    ? "Credit"
    : isWithdrawal
    ? "Withdrawal Request"
    : "Debit";

  const amountText = isCredit
    ? `+₦${tx.amount.toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    : `-₦${tx.amount.toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}${
        isWithdrawal ? " (Withdrawal)" : ""
      }`;

  const handleExternalCopy = (accountNumber?: string) => {
    if (!accountNumber) return;
    navigator.clipboard.writeText(accountNumber);
    alert("Account number copied!");
  };

  return (
    <div
      onClick={() => onClick?.(tx)}
      style={{
        display: "flex",
        alignItems: "center",
        padding: "14px 12px",
        backgroundColor: "#fff",
        borderRadius: 12,
        marginBottom: 12,
        cursor: onClick ? "pointer" : "default",
        boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
      }}
    >
      {/* Avatar */}
      <img
        src={tx.metadata?.senderAvatar || tx.metadata?.receiverAvatar || "https://i.pravatar.cc/80?img=12"}
        alt="avatar"
        style={{
          width: 42,
          height: 42,
          borderRadius: "50%",
          backgroundColor: "#eee",
        }}
      />

      {/* Info */}
      <div style={{ flex: 1, marginLeft: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontWeight: 700 }}>{title}</span>

          <span
            style={{
              padding: "2px 8px",
              borderRadius: 6,
              fontSize: 10,
              fontWeight: 600,
              backgroundColor:
                tx.status === "failed"
                  ? "#FCE4E4"
                  : tx.status === "pending"
                  ? "#FFF4E5"
                  : "#E6F9EF",
              color:
                tx.status === "failed"
                  ? "#D93030"
                  : tx.status === "pending"
                  ? "#F5A623"
                  : "#12C060",
            }}
          >
            {tx.status === "failed"
              ? "Failed"
              : tx.status === "pending"
              ? "Pending"
              : "Success"}
          </span>
        </div>

        {tx.reference && <div style={{ fontSize: 12, color: "#777", marginTop: 2 }}>Ref: {tx.reference}</div>}
        <div style={{ fontSize: 12, color: "#999", marginTop: 2 }}>
          {new Date(tx.createdAt).toLocaleString()}
        </div>

        {tx.metadata?.externalBank && (
          <div
            style={{ fontSize: 12, color: "#555", marginTop: 2, fontStyle: "italic", cursor: "pointer" }}
            onClick={() => handleExternalCopy(tx.metadata.externalBank?.accountNumber)}
          >
            {tx.metadata.externalBank.bankName} ••••
            {tx.metadata.externalBank.accountNumber.slice(-4)}
          </div>
        )}
      </div>

      {/* Amount */}
      <div
        style={{
          fontWeight: 700,
          fontSize: 18,
          marginLeft: 10,
          minWidth: 110,
          textAlign: "right",
          color,
        }}
      >
        {amountText}
      </div>
    </div>
  );
}
