"use client";

import { useEffect, useState } from "react";
import { TransactionItem, isValidTransaction } from "@/app/transactions/page";

export function useTransactionsSSE() {
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);

  useEffect(() => {
    const es = new EventSource("/api/transactions/sse", {
      fetch: (input, init) =>
        fetch(input as RequestInfo, { ...init, credentials: "include" }), // cookie auth
    });

    es.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        const newTxs: TransactionItem[] = Array.isArray(data)
          ? data.filter(isValidTransaction)
          : isValidTransaction(data)
          ? [data]
          : [];

        if (!newTxs.length) return;

        setTransactions((prev) => {
          // Create a map by requestId to deduplicate and merge PROCESSING updates
          const txMap = new Map(prev.map((tx) => [tx.requestId, tx]));

          newTxs.forEach((tx) => {
            txMap.set(tx.requestId, tx);
          });

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
