// components/WithdrawalModal.tsx
"use client";

import React, { useState, useEffect } from "react";
import api from "@/lib/api";

type Goal = {
  id: string;
  title: string;
  currentBalance: number;
  targetAmount: number;
};

type WithdrawalModalProps = {
  goal: Goal;
  onClose: () => void;
};

export default function WithdrawalModal({ goal, onClose }: WithdrawalModalProps) {
  const [otp, setOtp] = useState<string>("");

  // Request OTP when modal mounts
  const requestOtp = async () => {
    try {
      await api.post(`/savings/goals/${goal.id}/break`);
    } catch (err) {
      console.error("Failed to request OTP", err);
    }
  };

  // Confirm withdrawal with OTP
  const confirm = async () => {
    try {
      await api.post(`/savings/goals/${goal.id}/break/confirm`, { otp });
      onClose();
    } catch (err) {
      console.error("Failed to confirm withdrawal", err);
    }
  };

  useEffect(() => {
    requestOtp();
  }, [goal.id]);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-900 p-6 rounded max-w-md w-full space-y-4">
        <h2 className="text-xl font-bold">Confirm Withdrawal</h2>
        <p>OTP sent to your email</p>

        <input
          type="text"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          placeholder="Enter OTP"
          className="w-full p-2 border rounded"
        />

        <div className="flex gap-2 mt-4">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-300 dark:bg-gray-700 p-2 rounded"
          >
            Cancel
          </button>
          <button
            onClick={confirm}
            className="flex-1 bg-blue-600 text-white p-2 rounded"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
