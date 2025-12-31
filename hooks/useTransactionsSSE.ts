"use client";

import { useEffect, useState } from "react";
import { Transaction } from "../lib/types";

// ---------------------------
// Type guard
// ---------------------------
function isValidTransaction(tx: any): tx is Transaction {
  return (
    tx &&
    typeof tx.requestId === "string" &&
    typeof tx.serviceId === "string" &&
    typeof tx.status === "string" &&
    typeof tx.amount === "number" &&
    typeof tx.createdAt === "string"
  );
}

// ---------------------------
// SSE Hook
// ---------------------------
export function useTransactionsSSE() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    // SSE with cookies (HttpOnly auth)
    const es = new EventSource("/api/transactions/sse", {
      fetch: (input, init) =>
        fetch(input as RequestInfo, { ...init, credentials: "include" }),
    });

    es.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        const newTxs = Array.isArray(data) ? data.filter(isValidTransaction) : isValidTransaction(data) ? [data] : [];

        if (newTxs.length === 0) return;

        setTransactions((prev) => {
          const txMap = new Map(prev.map((tx) => [tx.requestId, tx]));

          // Merge / update by requestId
          newTxs.forEach((tx) => txMap.set(tx.requestId, tx));

          // Sort newest first
          return Array.from(txMap.values()).sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        });
      } catch (err) {
        console.error("Failed to parse SSE transaction:", err);
      }
    };

    es.onerror = (err) => {
      console.error("SSE connection error:", err);
      es.close();
    };

    return () => es.close();
  }, []);

  return transactions;
}
