// hooks/useBiometricWebSync.ts
import { useState, useEffect, useCallback } from "react";

type Status = "idle" | "waiting" | "verified" | "failed";

interface BiometricHookOptions {
  onStart?: () => void;
  onVerified?: () => void;
  onFailed?: () => void;
  sessionId?: string;
}

interface BiometricHookReturn {
  status: Status;
  isListening: boolean;
  result: Status | null;
  startBiometricSession: () => void;
}

export function useBiometricWebSync(options: BiometricHookOptions = {}): BiometricHookReturn {
  const { onStart, onVerified, onFailed, sessionId } = options;

  const [status, setStatus] = useState<Status>("idle");
  const [result, setResult] = useState<Status | null>(null);
  const [isListening, setIsListening] = useState(false);

  const startBiometricSession = useCallback(() => {
    if (isListening) return;

    onStart?.();
    setStatus("waiting");
    setIsListening(true);

    // Optional WebSocket for backend confirmation
    if (!sessionId) return;

    const ws = new WebSocket(`${process.env.NEXT_PUBLIC_WS_URL}/biometric?sessionId=${sessionId}`);

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.event === "biometric_verified") {
          setStatus("verified");
          setResult("verified");
          onVerified?.();
          ws.close();
          setIsListening(false);
        }

        if (data.event === "biometric_failed") {
          setStatus("failed");
          setResult("failed");
          onFailed?.();
          ws.close();
          setIsListening(false);
        }
      } catch (err) {
        console.error("WebSocket parse error:", err);
        setStatus("failed");
        setResult("failed");
        onFailed?.();
        setIsListening(false);
      }
    };

    ws.onerror = (err) => {
      console.error("WebSocket error:", err);
      setStatus("failed");
      setResult("failed");
      onFailed?.();
      setIsListening(false);
      ws.close();
    };
  }, [onStart, onVerified, onFailed, isListening, sessionId]);

  return {
    status,
    isListening,
    result,
    startBiometricSession,
  };
}
