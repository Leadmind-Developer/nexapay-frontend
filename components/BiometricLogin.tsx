"use client";

import { useState, useEffect } from "react";
import { useBiometricWebSync } from "@/hooks/useBiometricWebSync";

export default function BiometricLogin() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [message, setMessage] = useState<string>("");
  const { status } = useBiometricWebSync(sessionId || undefined);

  async function handleRequestBiometric() {
    setMessage("Requesting biometric login...");

    const res = await fetch("/api/auth/request-biometric", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
    const data = await res.json();

    if (data.success && data.sessionId) {
      setSessionId(data.sessionId);
      setMessage("Waiting for mobile confirmation...");
    } else {
      setMessage("Failed to initiate biometric login.");
    }
  }

  useEffect(() => {
    if (status === "verified") {
      setMessage("✅ Biometric verified! Logging you in...");
      // you can now fetch session or redirect
      window.location.href = "/dashboard";
    } else if (status === "failed") {
      setMessage("❌ Connection failed. Try again.");
    }
  }, [status]);

  return (
    <div className="flex flex-col items-center gap-4">
      <button
        onClick={handleRequestBiometric}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
      >
        Login with Biometric
      </button>
      <p className="text-sm text-gray-600">{message}</p>
      {status === "waiting" && (
        <p className="text-xs text-yellow-600">Waiting for mobile confirmation...</p>
      )}
    </div>
  );
}
"use client";

import React, { useState, useEffect } from "react";
import { useBiometricWebSync } from "@/hooks/useBiometricWebSync";

export default function BiometricLogin() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [message, setMessage] = useState<string>("");
  const { status } = useBiometricWebSync(sessionId || undefined);

  async function handleRequestBiometric() {
    setMessage("Requesting biometric login...");

    const res = await fetch("/api/auth/request-biometric", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
    const data = await res.json();

    if (data.success && data.sessionId) {
      setSessionId(data.sessionId);
      setMessage("Waiting for mobile confirmation...");
    } else {
      setMessage("Failed to initiate biometric login.");
    }
  }

  useEffect(() => {
    if (status === "verified") {
      setMessage("✅ Biometric verified! Logging you in...");
      // you can now fetch session or redirect
      window.location.href = "/dashboard";
    } else if (status === "failed") {
      setMessage("❌ Connection failed. Try again.");
    }
  }, [status]);

  return (
    <div className="flex flex-col items-center gap-4">
      <button
        onClick={handleRequestBiometric}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
      >
        Login with Biometric
      </button>
      <p className="text-sm text-gray-600">{message}</p>
      {status === "waiting" && (
        <p className="text-xs text-yellow-600">Waiting for mobile confirmation...</p>
      )}
    </div>
  );
}
