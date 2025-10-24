"use client";
import { useEffect } from "react";
import { mutate } from "swr";

export function useTransactionsSocket() {
  useEffect(() => {
    const ws = new WebSocket(process.env.NEXT_PUBLIC_WS_URL || "wss://nexapay-backend-138118361183.us-central1.run.app");

    ws.onopen = () => console.log("✅ WebSocket connected to Nexa backend");
    ws.onclose = () => console.log("❌ WebSocket disconnected");
    ws.onerror = (e) => console.error("WebSocket error:", e);

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);

        if (msg.type === "transaction_update") {
          // Update SWR cache instantly
          mutate("/transactions", (current: any[] = []) => {
            // Avoid duplicates (same ID)
            const exists = current.some((t) => t.id === msg.data.id);
            return exists ? current.map((t) => (t.id === msg.data.id ? msg.data : t)) : [msg.data, ...current];
          }, false);
        }
      } catch (err) {
        console.error("Error parsing WebSocket message:", err);
      }
    };

    return () => ws.close();
  }, []);
}
