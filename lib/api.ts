"use client";

import { useRef, useState, useEffect } from "react";
import api, { Payload } from "@/lib/api";

interface OTPInputProps {
  length?: number;
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;

  /* 🔐 Recovery support */
  identifier?: string;
  purpose?: string;
  hasWhatsApp?: boolean;

  // Optional override from parent
  rateLimited?: boolean; // comes from backend or parent
}

export default function OTPInput({
  length = 6,
  value,
  onChange,
  disabled = false,
  identifier,
  purpose,
  hasWhatsApp = false,
  rateLimited: rateLimitedProp = false,
}: OTPInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState<"email" | "whatsapp" | null>(null);
  const [sent, setSent] = useState<"email" | "whatsapp" | null>(null);
  const [internalRateLimited, setInternalRateLimited] = useState(false);

  // Show recovery if parent says rateLimited OR we internally detected too_many_requests
  const showRecovery = rateLimitedProp || internalRateLimited;

  async function requestRecovery(channel: "email" | "whatsapp") {
    if (!identifier || !purpose) return;

    try {
      setLoading(channel);

      const payload: Payload = { identifier, purpose, channel };
      const res = await api.post("/auth/otp/recovery", payload);

      if (res.data.success) {
        setSent(channel);
        setInternalRateLimited(true); // ensure buttons stay visible
      } else if (res.data.message === "too_many_requests") {
        setInternalRateLimited(true);
      } else {
        console.warn("OTP recovery response:", res.data);
        setInternalRateLimited(true);
      }
    } catch (err) {
      console.error("OTP recovery failed:", err);
      setInternalRateLimited(true); // fallback
    } finally {
      setLoading(null);
    }
  }

  return (
    <>
      {/* OTP INPUT */}
      <div
        className="flex justify-center gap-2 cursor-text"
        onClick={() => inputRef.current?.focus()}
      >
        <input
          ref={inputRef}
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={length}
          value={value}
          disabled={disabled}
          onChange={(e) =>
            onChange(e.target.value.replace(/\D/g, "").slice(0, length))
          }
          className="absolute opacity-0 pointer-events-none"
        />
        {Array.from({ length }).map((_, i) => (
          <div
            key={i}
            className={`w-12 h-12 flex items-center justify-center border rounded-lg text-xl
              ${value[i] ? "border-blue-500" : "border-gray-300"}`}
          >
            {value[i] || ""}
          </div>
        ))}
      </div>

      {/* 🔓 RECOVERY OPTIONS */}
      {showRecovery && (
        <div className="mt-5 text-center space-y-2">
          <p className="text-sm text-gray-500">Trouble receiving your code?</p>

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
