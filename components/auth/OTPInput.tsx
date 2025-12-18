import { useState, useEffect } from "react";

export default function OTPInput({
  length = 6,
  value,
  onChange,
}: {
  length?: number;
  value: string;
  onChange: (v: string) => void;
}) {
  const [values, setValues] = useState(Array(length).fill(""));

  useEffect(() => {
    onChange(values.join(""));
  }, [values]);

  return (
    <div className="flex space-x-2 justify-center">
      {values.map((v, i) => (
        <input
          key={i}
          type="text"
          maxLength={1}
          value={v}
          onChange={(e) => {
            const val = e.target.value.replace(/\D/, "");
            setValues((prev) => {
              const copy = [...prev];
              copy[i] = val;
              return copy;
            });
          }}
          className="w-12 h-12 text-center border rounded-lg"
        />
      ))}
    </div>
  );
}
