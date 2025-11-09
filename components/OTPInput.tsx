// components/OTPInput.tsx
"use client";

import { useState } from "react";

interface OTPInputProps {
  length?: number;
  value: string;
  onChange: (otp: string) => void;
  disabled?: boolean;
}

export default function OTPInput({
  length = 6,
  value,
  onChange,
  disabled = false,
}: OTPInputProps) {
  const [internalOtp, setInternalOtp] = useState(value);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, idx: number) => {
    const val = e.target.value.replace(/\D/g, "");
    const otpArr = internalOtp.split("");
    otpArr[idx] = val[0] || "";
    const newOtp = otpArr.join("").padEnd(length, "");
    setInternalOtp(newOtp);
    onChange(newOtp);
    const nextInput = document.getElementById(`otp-${idx + 1}`);
    if (nextInput) (nextInput as HTMLInputElement).focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, idx: number) => {
    if (e.key === "Backspace") {
      const otpArr = internalOtp.split("");
      otpArr[idx] = "";
      setInternalOtp(otpArr.join(""));
      onChange(otpArr.join(""));
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
          maxLength={1}
          value={internalOtp[idx] || ""}
          onChange={(e) => handleChange(e, idx)}
          onKeyDown={(e) => handleKeyDown(e, idx)}
          disabled={disabled}
          className="w-12 h-12 text-center text-xl border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:text-white"
        />
      ))}
    </div>
  );
}
