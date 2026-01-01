"use client";

import { useEffect, useState } from "react";
import { TransactionItem } from "@/lib/transactions/transaction.types";

export function useTransactionsSSE() {
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);

  useEffect(() => {
    const es = new EventSource("/api/transactions/sse");

    es.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        const newTxs: TransactionItem[] = Array.isArray(data) ? data : [data];

        if (!newTxs.length) return;

        setTransactions((prev) => {
          const txMap = new Map(prev.map((tx) => [tx.requestId, tx]));
          newTxs.forEach((tx) => txMap.set(tx.requestId, tx));

          return Array.from(txMap.values()).sort(
            (a, b) =>
              new Date(b.createdAt).getTime() -
              new Date(a.createdAt).getTime()
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
