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
  {rateLimited && (
  <div className="mt-4 text-center space-y-2">
    <p className="text-sm text-gray-500">
      Trouble receiving OTP?
    </p>

    <button
      onClick={requestEmailRecovery}
      className="text-blue-600 text-sm underline"
    >
      Verify via Email
    </button>

    {hasWhatsApp && (
      <button
        onClick={requestWhatsAppRecovery}
        className="text-green-600 text-sm underline block"
      >
        Verify via WhatsApp
      </button>
    )}
  </div>
)}
}


routes/otpRecovery.routes.js

// routes/otprecovery
import express from "express";
import prisma from "../lib/prisma.js";
import { sendMail } from "../lib/mailer.js";
import {
  generateOtpRecoveryToken,
  buildOtpRecoveryEmail,
  verifyOtpRecoveryToken,
} from "../middleware/OTPLimitRecovery.js";

const router = express.Router();

router.post("/recovery", async (req, res) => {
  const { identifier, purpose } = req.body;

  if (!identifier || !purpose) {
    return res.status(400).json({
      success: false,
      message: "Identifier and purpose are required",
    });
  }

  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { email: identifier },
        { phone: identifier },
      ],
    },
  });

  if (!user) {
    // Silent fail (avoid account probing)
    return res.json({ success: true });
  }

  const token = generateOtpRecoveryToken({
    userId: user.id,
    identifier,
    purpose,
  });

  const link = `${process.env.APP_URL}/auth/otp/recovery/verify?token=${token}`;

  await sendMail({
    to: user.email,
    subject: "Verify Your Account – Nexa",
    html: buildOtpRecoveryEmail({
      customerName: user.name,
      link,
    }),
  });

//Verify Magic Link
router.get("/recovery/verify", async (req, res) => {
  const { token } = req.query;

  if (!token) {
    return res.redirect("/auth/error?reason=invalid_link");
  }

  const decoded = verifyOtpRecoveryToken(token);

  if (!decoded) {
    return res.redirect("/auth/error?reason=expired_or_invalid");
  }

  const { identifier, purpose, userId } = decoded;

  // 🔓 Clear OTP rate limits
  await prisma.otpRateLimit.deleteMany({
    where: {
      identifier,
      purpose,
    },
  });

  // ✅ Mark user verified / authenticated
  // (depends on your auth flow)
  // Example: issue session or redirect with success token

  return res.redirect(
    `${process.env.APP_URL}/auth/success?recovered=true`
  );
});

  return res.json({
    success: true,
    message: "Verification link sent to email",
  });
});

export default router;
