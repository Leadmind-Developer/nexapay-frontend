// components/admin/refunds/ApproveRefundDialog.tsx

"use client";

import { useEffect, useState } from "react";

import { Refund } from "./types";
import { RefundAPI } from "@/lib/refunds";

interface Props {
  refund: Refund | null;
  onClose: () => void;
  onSuccess: () => void;
}

function formatAmount(amount: number) {
  return `₦${(amount / 100).toLocaleString()}`;
}

export default function ApproveRefundDialog({
  refund,
  onClose,
  onSuccess,
}: Props) {
  const [loading, setLoading] =
    useState(false);

  useEffect(() => {
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape" && !loading) {
        onClose();
      }
    }

    window.addEventListener(
      "keydown",
      handleEscape
    );

    return () =>
      window.removeEventListener(
        "keydown",
        handleEscape
      );
  }, [loading, onClose]);

  if (!refund) return null;

  async function approve() {
    try {
      setLoading(true);

      await RefundAPI.approve(refund.id);

      onSuccess();
      onClose();
    } catch (err: any) {
      alert(
        err.response?.data?.message ||
          "Unable to approve refund."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={() => {
        if (!loading) onClose();
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-2xl bg-white shadow-2xl"
      >
        {/* Header */}

        <div className="border-b px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-green-100">
              <svg
                className="h-6 w-6 text-green-600"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Approve Refund
              </h2>

              <p className="text-sm text-gray-500">
                Review before crediting the wallet.
              </p>
            </div>
          </div>
        </div>

        {/* Details */}

        <div className="space-y-4 px-6 py-5">
          <div className="rounded-xl border bg-gray-50 p-4">
            <div className="flex justify-between py-2">
              <span className="text-gray-500">
                Customer
              </span>

              <span className="font-medium">
                {refund.user?.firstName}{" "}
                {refund.user?.lastName}
              </span>
            </div>

            <div className="flex justify-between py-2">
              <span className="text-gray-500">
                Amount
              </span>

              <span className="font-semibold text-lg">
                {formatAmount(refund.amount)}
              </span>
            </div>

            <div className="flex justify-between py-2">
              <span className="text-gray-500">
                Source
              </span>

              <span>{refund.sourceType}</span>
            </div>

            <div className="flex justify-between py-2">
              <span className="text-gray-500">
                Reference
              </span>

              <span className="font-mono text-xs">
                {refund.reference}
              </span>
            </div>
          </div>

          <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
            <p className="text-sm text-yellow-800">
              <strong>Important:</strong> Approving
              this refund will immediately credit the
              customer's wallet and mark this refund
              as completed. This action cannot be
              undone.
            </p>
          </div>
        </div>

        {/* Footer */}

        <div className="flex justify-end gap-3 border-t px-6 py-5">
          <button
            disabled={loading}
            onClick={onClose}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium transition hover:bg-gray-100 disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            disabled={loading}
            onClick={approve}
            className="rounded-lg bg-green-600 px-5 py-2 text-sm font-medium text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-green-400"
          >
            {loading
              ? "Approving..."
              : "Approve Refund"}
          </button>
        </div>
      </div>
    </div>
  );
}
