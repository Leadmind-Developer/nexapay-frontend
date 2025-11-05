// components/OTPInput.tsx
"use client";

import { useState } from "react";

interface OTPInputProps {
  length?: number;
  value?: string;
  onChange: (otp: string) => void;
  disabled?: boolean;
  autoFocus?: boolean;
}

export default function OTPInput({
  length = 6,
  value = "",
  onChange,
  disabled = false,
  autoFocus = true,
}: OTPInputProps) {
  const [otp, setOtp] = useState(value);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, idx: number) => {
    const val = e.target.value.replace(/\D/g, "");
    if (!val) return;
    const newOtp = otp.split("").map((c, i) => (i === idx ? val[0] : c)).join("");
    setOtp(newOtp.padEnd(length, ""));
    onChange(newOtp.padEnd(length, ""));
    // Move focus to next input
    const nextInput = document.getElementById(`otp-${idx + 1}`);
    if (nextInput) (nextInput as HTMLInputElement).focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, idx: number) => {
    if (e.key === "Backspace") {
      const newOtp = otp.split("").map((c, i) => (i === idx ? "" : c)).join("");
      setOtp(newOtp);
      onChange(newOtp);
      const prevInput = document.getElementById(`otp-${idx - 1}`);
      if (prevInput) (prevInput as HTMLInputElement).focus();
    }
  };

  return (
    <div className="flex justify-center gap-2">
      {Array.from({ length }).map((_, idx) => (
        <input
          key={idx}
          id={`otp-${idx}`}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={otp[idx] || ""}
          onChange={(e) => handleChange(e, idx)}
          onKeyDown={(e) => handleKeyDown(e, idx)}
          disabled={disabled}
          autoFocus={autoFocus && idx === 0}
          className="w-12 h-12 text-center text-xl border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:text-white"
        />
      ))}
    </div>
  );
}
