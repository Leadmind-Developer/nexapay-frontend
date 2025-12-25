"use client";

import { useEffect, useState } from "react";

export function useTransactionsSSE() {
  const [processingTxs, setProcessingTxs] = useState<any[]>([]);

  useEffect(() => {
    const evtSource = new EventSource("/transactions/sse");

    evtSource.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        setProcessingTxs(data);
      } catch (err) {
        console.error("SSE parse error:", err);
      }
    };

    evtSource.onerror = (err) => {
      console.error("SSE error:", err);
      evtSource.close();
    };

    return () => evtSource.close();
  }, []);

  return processingTxs;
}
