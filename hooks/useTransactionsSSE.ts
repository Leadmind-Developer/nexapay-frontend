"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";

export interface Transaction {
  requestId?: string;
  serviceId?: string;
  status?: "SUCCESS" | "FAILED" | "PROCESSING" | string;
  amount?: number;
  createdAt?: string;
  apiResponse?: {
    pin?: string;
    token?: string;
  };
  phone?: string;
  billersCode?: string;
}

/**
 * Hook: Subscribe to real-time processing transactions via SSE.
 * Always returns a valid array (empty if none) and filters invalid items.
 */
export function useTransactionsSSE(): Transaction[] {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    let eventSource: EventSource | null = null;

    const initSSE = () => {
      try {
        eventSource = new EventSource(`${api.defaults.baseURL}/transactions/sse`, {
          withCredentials: true,
        });

        eventSource.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (!Array.isArray(data)) return;

            // Filter out invalid items
            const validTxs = data.filter(
              (tx) =>
                tx &&
                typeof tx.requestId === "string" &&
                typeof tx.serviceId === "string" &&
                typeof tx.status === "string" &&
                tx.createdAt &&
                !isNaN(new Date(tx.createdAt).getTime())
            );

            setTransactions(validTxs);
          } catch (err) {
            console.error("Failed to parse SSE data:", err);
            setTransactions([]); // fallback to empty array
          }
        };

        eventSource.onerror = (err) => {
          console.error("SSE connection error:", err);
          setTransactions([]); // reset on error
          // Optionally try reconnect after a delay
          eventSource?.close();
          setTimeout(initSSE, 5000);
        };
      } catch (err) {
        console.error("Failed to initialize SSE:", err);
      }
    };

    initSSE();

    return () => {
      eventSource?.close();
    };
  }, []);

  return transactions;
}
