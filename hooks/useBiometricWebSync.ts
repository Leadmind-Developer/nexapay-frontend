// hooks/useBiometricWebSync.ts
import { useEffect, useState } from "react";

export function useBiometricWebSync(sessionId?: string) {
  const [status, setStatus] = useState<"idle" | "waiting" | "verified" | "failed">("idle");

  useEffect(() => {
    if (!sessionId) return;
    setStatus("waiting");

    // ✅ Option 1: WebSocket connection
    const ws = new WebSocket(`${process.env.NEXT_PUBLIC_WS_URL}/biometric?sessionId=${sessionId}`);

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.event === "biometric_verified") {
          setStatus("verified");
          ws.close();
        }
      } catch (err) {
        console.error("WebSocket parse error:", err);
      }
    };

    ws.onerror = (err) => {
      console.error("WebSocket error:", err);
      setStatus("failed");
    };

    return () => ws.close();
  }, [sessionId]);

  return { status };
}
