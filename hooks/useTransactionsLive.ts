import { useEffect, useState } from "react";
import api from "@/lib/api";

export function useTransactionsLive() {
  const [data, setData] = useState<any[]>([]);
  const [sseFailed, setSseFailed] = useState(false);

  useEffect(() => {
    let es: EventSource | null = null;

    try {
      es = new EventSource("/api/transactions/sse");

      es.onmessage = (e) => {
        const payload = JSON.parse(e.data);
        setData(payload);
      };

      es.onerror = () => {
        setSseFailed(true);
        es?.close();
      };
    } catch {
      setSseFailed(true);
    }

    return () => es?.close();
  }, []);

  return { data, sseFailed };
}
