// components/admin/refunds/ApproveRefundDialog.tsx

"use client";

import { Refund } from "./types";
import { RefundAPI } from "@/lib/refunds";

interface Props {
  refund: Refund | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ApproveRefundDialog({
  refund,
  onClose,
  onSuccess,
}: Props) {
  if (!refund) return null;

  const safeRefund = refund;

  async function approve() {
    await RefundAPI.approve(safeRefund.id);

    onSuccess();
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
      <div className="bg-white p-6 rounded-xl w-[450px]">
        <h2 className="text-xl font-bold">Approve Refund</h2>

        <p className="mt-4">
          Refund ₦{(safeRefund.amount / 100).toLocaleString()}?
        </p>

        <p className="text-sm text-gray-500 mt-2">
          This action cannot be undone.
        </p>

        <div className="flex gap-2 mt-5">
          <button onClick={onClose} className="border px-4 py-2 rounded">
            Cancel
          </button>

          <button
            onClick={approve}
            className="bg-green-600 text-white px-4 py-2 rounded"
          >
            Approve Refund
          </button>
        </div>
      </div>
    </div>
  );
}
