// components/BiometricLogin.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { useBiometricWebSync } from "@/hooks/useBiometricWebSync";
import { Button } from "@/components/ui/button";

type Status = "idle" | "waiting" | "verified" | "failed";

/**
 * BiometricLogin
 * Waits for backend confirmation (via WebSocket /auth/verify-biometric)
 * Provides smooth feedback animations and auto-reset.
 */
export default function BiometricLogin() {
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("Tap below to request biometric login");

  const { startBiometricSession, isListening, result } = useBiometricWebSync({
    onStart: () => {
      setStatus("waiting");
      setMessage("Waiting for biometric confirmation...");
    },
    onVerified: () => {
      setStatus("verified");
      setMessage("Biometric verification successful ✅");
      resetAfterDelay();
    },
    onFailed: () => {
      setStatus("failed");
      setMessage("Biometric verification failed ❌");
      resetAfterDelay();
    },
  });

  /** Auto-reset UI after a few seconds */
  const resetAfterDelay = useCallback(() => {
    setTimeout(() => {
      setStatus("idle");
      setMessage("Tap below to request biometric login");
    }, 4000);
  }, []);

  /** Sync local status with hook result as a safeguard */
  useEffect(() => {
    if (!result) return;

    if (result === "verified") {
      setStatus("verified");
      setMessage("Biometric verified successfully ✅");
      resetAfterDelay();
    } else if (result === "failed") {
      setStatus("failed");
      setMessage("Verification failed ❌");
      resetAfterDelay();
    }
  }, [result, resetAfterDelay]);

  return (
    <div className="flex flex-col items-center justify-center py-12 space-y-6">
      <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
        Biometric Login
      </h2>

      <p className="text-sm text-gray-500 dark:text-gray-400 text-center px-4 max-w-sm">
        {message}
      </p>

      {/* Animated status */}
      <AnimatePresence mode="wait">
        {status === "waiting" && (
          <motion.div
            key="waiting"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center space-y-2"
          >
            <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
            <span className="text-blue-500 text-sm">Awaiting confirmation...</span>
          </motion.div>
        )}

        {status === "verified" && (
          <motion.div
            key="verified"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center space-y-2"
          >
            <CheckCircle2 className="w-10 h-10 text-green-500" />
            <span className="text-green-500 text-sm">Verified</span>
          </motion.div>
        )}

        {status === "failed" && (
          <motion.div
            key="failed"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center space-y-2"
          >
            <XCircle className="w-10 h-10 text-red-500" />
            <span className="text-red-500 text-sm">Failed</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main button */}
      <Button
        onClick={startBiometricSession}
        disabled={status === "waiting" || isListening}
        className="mt-6 px-6 py-3 text-base font-medium rounded-xl shadow bg-blue-600 text-white hover:bg-blue-700 transition-all"
      >
        {status === "waiting" ? "Waiting..." : "Start Biometric Login"}
      </Button>
    </div>
  );
}
