// components/admin/refunds/RefundFormModal.tsx

"use client";

import { useState } from "react";
import { RefundAPI } from "@/lib/refunds";

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function RefundFormModal({
  open,
  onClose,
  onSuccess,
}: Props) {
  const [form, setForm] = useState({
    userId: "",
    amount: "",
    sourceType: "",
    sourceId: "",
    reason: "",
  });

  const [loading, setLoading] =
    useState(false);

  if (!open) return null;

  async function submit() {
    try {
      setLoading(true);

      await RefundAPI.create({
        userId: Number(form.userId),
        amount: Number(form.amount) * 100,
        sourceType: form.sourceType,
        sourceId: form.sourceId,
        reason: form.reason,
      });

      onSuccess();
      onClose();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
      <div className="bg-white p-6 rounded-xl w-full max-w-lg">
        <h2 className="text-xl font-bold mb-4">
          Create Refund
        </h2>

        <div className="space-y-3">
          <input
            placeholder="User ID"
            className="w-full border p-2 rounded"
            value={form.userId}
            onChange={(e) =>
              setForm({
                ...form,
                userId: e.target.value,
              })
            }
          />

          <input
            placeholder="Amount"
            className="w-full border p-2 rounded"
            value={form.amount}
            onChange={(e) =>
              setForm({
                ...form,
                amount: e.target.value,
              })
            }
          />

          <input
            placeholder="Source Type"
            className="w-full border p-2 rounded"
            value={form.sourceType}
            onChange={(e) =>
              setForm({
                ...form,
                sourceType: e.target.value,
              })
            }
          />

          <input
            placeholder="Source ID"
            className="w-full border p-2 rounded"
            value={form.sourceId}
            onChange={(e) =>
              setForm({
                ...form,
                sourceId: e.target.value,
              })
            }
          />

          <textarea
            placeholder="Reason"
            className="w-full border p-2 rounded"
            value={form.reason}
            onChange={(e) =>
              setForm({
                ...form,
                reason: e.target.value,
              })
            }
          />
        </div>

        <div className="flex gap-2 mt-5">
          <button
            onClick={onClose}
            className="border px-4 py-2 rounded"
          >
            Cancel
          </button>

          <button
            disabled={loading}
            onClick={submit}
            className="bg-[#39358c] text-white px-4 py-2 rounded"
          >
            Create Refund
          </button>
        </div>
      </div>
    </div>
  );
}
