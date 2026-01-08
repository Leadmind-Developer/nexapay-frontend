"use client";

import { useRef, useState } from "react";

interface OTPInputProps {
  length?: number;
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;

  /* 🔐 Recovery support (non-breaking additions) */
  identifier?: string;
  purpose?: string;
  rateLimited?: boolean;
  hasWhatsApp?: boolean;
}

export default function OTPInput({
  length = 6,
  value,
  onChange,
  disabled = false,

  identifier,
  purpose,
  rateLimited = false,
  hasWhatsApp = false,
}: OTPInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState<"email" | "whatsapp" | null>(null);
  const [sent, setSent] = useState<"email" | "whatsapp" | null>(null);

  async function requestRecovery(channel: "email" | "whatsapp") {
    if (!identifier || !purpose) return;

    try {
      setLoading(channel);

      await fetch("/api/otp/recovery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identifier,
          purpose,
          channel, // backend may ignore or extend later
        }),
      });

      setSent(channel);
    } catch (err) {
      console.error("OTP recovery failed:", err);
    } finally {
      setLoading(null);
    }
  }

  return (
    <>
      {/* OTP INPUT (UNCHANGED CORE LOGIC) */}
      <div
        className="flex justify-center gap-2 cursor-text"
        onClick={() => inputRef.current?.focus()}
      >
        {/* Hidden real input */}
        <input
          ref={inputRef}
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={length}
          value={value}
          disabled={disabled}
          onChange={(e) => {
            const digits = e.target.value
              .replace(/\D/g, "")
              .slice(0, length);
            onChange(digits);
          }}
          className="absolute opacity-0 pointer-events-none"
        />

        {/* Visual boxes */}
        {Array.from({ length }).map((_, i) => (
          <div
            key={i}
            className={`w-12 h-12 flex items-center justify-center border rounded-lg text-xl
              ${value[i] ? "border-blue-500" : "border-gray-300"}
            `}
          >
            {value[i] || ""}
          </div>
        ))}
      </div>

      {/* 🔓 RECOVERY OPTIONS (ONLY WHEN RATE LIMITED) */}
      {rateLimited && (
        <div className="mt-5 text-center space-y-2">
          <p className="text-sm text-gray-500">
            Trouble receiving your code?
          </p>

          {/* Email Recovery */}
          <button
            onClick={() => requestRecovery("email")}
            disabled={loading !== null}
            className="text-blue-600 text-sm underline disabled:opacity-50"
          >
            {sent === "email"
              ? "Verification link sent to email"
              : loading === "email"
              ? "Sending email…"
              : "Verify via Email"}
          </button>

          {/* WhatsApp Recovery */}
          {hasWhatsApp && (
            <button
              onClick={() => requestRecovery("whatsapp")}
              disabled={loading !== null}
              className="block mx-auto text-green-600 text-sm underline disabled:opacity-50"
            >
              {sent === "whatsapp"
                ? "Verification link sent to WhatsApp"
                : loading === "whatsapp"
                ? "Sending WhatsApp message…"
                : "Verify via WhatsApp"}
            </button>
          )}
        </div>
      )}
    </>
  );
}
