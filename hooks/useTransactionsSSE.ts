"use client";

import { useEffect, useState } from "react";
import { EventSourcePolyfill } from "event-source-polyfill";
import api from "@/lib/api";

/**
 * Frontend-safe transaction type
 */
export interface TransactionItem {
  requestId: string;
  serviceId: string;
  status: "SUCCESS" | "FAILED" | "PROCESSING" | string;
  amount: number;
  createdAt: string;
  phone?: string;
  billersCode?: string;
  apiResponse?: {
    pin?: string;
    token?: string;
  };
  meta?: Record<string, any>;
}

/**
 * Type guard: ensures object is a valid TransactionItem
 */
export function isValidTransaction(obj: any): obj is TransactionItem {
  return (
    obj &&
    typeof obj.requestId === "string" &&
    typeof obj.serviceId === "string" &&
    typeof obj.status === "string" &&
    typeof obj.amount === "number" &&
    typeof obj.createdAt === "string"
  );
}

/**
 * Hook: SSE subscription for live transactions
 * Guarantees only valid transactions are emitted
 */
export function useTransactionsSSE(): TransactionItem[] {
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);

  useEffect(() => {
    const sseUrl = "/transactions/sse"; // adjust to your backend SSE endpoint
    const es = new EventSourcePolyfill(sseUrl, {
      headers: { Authorization: `Bearer ${api.getToken()}` }, // if needed
    });

    es.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        // data could be a single transaction or an array
        const items: any[] = Array.isArray(data) ? data : [data];

        // filter out invalid items
        const validTransactions = items.filter(isValidTransaction);

        if (validTransactions.length > 0) {
          setTransactions((prev) => {
            // merge: remove old PROCESSING transactions that might be updated
            const nonProcessing = prev.filter(
              (tx) => tx.status !== "PROCESSING" && !validTransactions.find(v => v.requestId === tx.requestId)
            );
            return [...nonProcessing, ...validTransactions].sort(
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
      // Optionally attempt reconnect
    };

    return () => {
      es.close();
    };
  }, []);

  return transactions;
}
