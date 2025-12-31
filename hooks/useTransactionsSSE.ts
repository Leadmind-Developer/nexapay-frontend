"use client";

import { useEffect, useState } from "react";
import { Transaction } from "../lib/types";
import { EventSource } from "eventsource"; 

// -------------------------------
// Type guard: ensures SSE data is a valid Transaction
// -------------------------------
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

// -------------------------------
// SSE Hook
// -------------------------------
export function useTransactionsSSE(token?: string) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    if (!token) return;

    const es = new EventSource("/api/transactions/sse", {
      fetch: (input, init) =>
        fetch(input as RequestInfo, {
          ...init,
          headers: {
            ...(init?.headers || {}),
            Authorization: `Bearer ${token}`,
          },
        }),
    });

    es.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        const newTxs: Transaction[] = Array.isArray(data)
          ? data.filter(isValidTransaction)
          : isValidTransaction(data)
          ? [data]
          : [];

        if (!newTxs.length) return;

        setTransactions((prev) => {
          // Deduplicate by requestId
          const dedupedMap = new Map<string, Transaction>();

          [...newTxs, ...prev].forEach((tx) => {
            dedupedMap.set(tx.requestId, tx);
          });

          // Convert back to array and sort by createdAt descending
          return Array.from(dedupedMap.values()).sort(
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
  }, [token]);

  return transactions;
}
