"use client";

import { useEffect, useState } from "react";
import { Transaction } from "../lib/types";
import { EventSource } from "eventsource"; 

// Helper: Type guard to ensure a transaction is valid
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
        if (Array.isArray(data)) {
          const validTxs = data.filter(isValidTransaction);
          if (validTxs.length) {
            setTransactions((prev) => {
              // Remove any previous transactions with same requestId
              const filtered = prev.filter(
                (tx) => !validTxs.some((vtx) => vtx.requestId === tx.requestId)
              );
              return [...filtered, ...validTxs].sort(
                (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
              );
            });
          }
        } else if (isValidTransaction(data)) {
          setTransactions((prev) => {
            const exists = prev.some((tx) => tx.requestId === data.requestId);
            if (exists) return prev;
            return [data, ...prev].sort(
              (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
          });
        }
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
