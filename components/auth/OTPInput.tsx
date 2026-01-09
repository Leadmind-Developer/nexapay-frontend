// components/auth/OTPInput.tsx

 "use client";

import { useRef } from "react";

interface OTPInputProps {
  length?: number;
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
}

export default function OTPInput({
  length = 6,
  value,
  onChange,
  disabled = false,
}: OTPInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
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
          const digits = e.target.value.replace(/\D/g, "").slice(0, length);
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
  );
  
