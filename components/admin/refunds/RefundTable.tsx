"use client";

import { Refund } from "./types";

interface Props {
  refunds: Refund[];
  onApprove: (refund: Refund) => void;
  onReject: (refund: Refund) => void;
}

function formatDate(date?: string | Date | null) {
  if (!date) return "—";

  return new Date(date).toLocaleString("en-NG", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function statusBadge(status: string) {
  switch (status) {
    case "COMPLETED":
      return (
        <span className="inline-flex rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
          Completed
        </span>
      );

    case "PENDING":
      return (
        <span className="inline-flex rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-700">
          Pending
        </span>
      );

    case "REJECTED":
      return (
        <span className="inline-flex rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
          Rejected
        </span>
      );

    default:
      return (
        <span className="inline-flex rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
          {status}
        </span>
      );
  }
}

export default function RefundTable({
  refunds,
  onApprove,
  onReject,
}: Props) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="sticky top-0 border-b bg-gray-50">
            <tr className="text-left text-gray-700">
              <th className="px-5 py-4 font-semibold">
                User
              </th>

              <th className="px-5 py-4 font-semibold">
                Source
              </th>

              <th className="px-5 py-4 text-right font-semibold">
                Amount
              </th>

              <th className="px-5 py-4 font-semibold">
                Reference
              </th>

              <th className="px-5 py-4 font-semibold">
                Requested
              </th>

              <th className="px-5 py-4 font-semibold">
                Approved
              </th>

              <th className="px-5 py-4 font-semibold">
                Approved By
              </th>

              <th className="px-5 py-4 font-semibold">
                Status
              </th>

              <th className="px-5 py-4 text-center font-semibold">
                Action
              </th>
            </tr>
          </thead>

          <tbody>
            {refunds.length === 0 && (
              <tr>
                <td
                  colSpan={9}
                  className="py-12 text-center text-gray-500"
                >
                  No refunds found.
                </td>
              </tr>
            )}

            {refunds.map((refund, index) => (
              <tr
                key={refund.id}
                className={`
                  border-b last:border-0
                  hover:bg-indigo-50/40
                  transition-colors
                  ${
                    index % 2 === 0
                      ? "bg-white"
                      : "bg-gray-50/40"
                  }
                `}
              >
                <td className="px-5 py-4">
                  <div className="font-medium text-gray-900">
                    {refund.user?.firstName}{" "}
                    {refund.user?.lastName}
                  </div>

                  <div className="text-xs text-gray-500">
                    {refund.user?.email}
                  </div>
                </td>

                <td className="px-5 py-4">
                  <span className="rounded bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-700">
                    {refund.sourceType}
                  </span>
                </td>

                <td className="px-5 py-4 text-right font-semibold whitespace-nowrap">
                  ₦
                  {(refund.amount / 100).toLocaleString()}
                </td>

                <td className="px-5 py-4">
                  <span className="font-mono text-xs text-gray-600">
                    {refund.reference || "—"}
                  </span>
                </td>

                <td className="px-5 py-4 whitespace-nowrap text-gray-600">
                  {formatDate(refund.createdAt)}
                </td>

                <td className="px-5 py-4 whitespace-nowrap text-gray-600">
                  {formatDate(refund.processedAt)}
                </td>

                <td className="px-5 py-4">
                  {refund.approver ? (
                    <>
                      <div className="font-medium">
                        {refund.approver.firstName}{" "}
                        {refund.approver.lastName}
                      </div>

                      <div className="text-xs text-gray-500">
                        {refund.approver.email}
                      </div>
                    </>
                  ) : (
                    "—"
                  )}
                </td>

                <td className="px-5 py-4">
                  {statusBadge(refund.status)}
                </td>

                <td className="px-5 py-4">
                  {refund.status === "PENDING" ? (
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => onApprove(refund)}
                        className="rounded-lg bg-green-600 px-3 py-2 text-xs font-medium text-white transition hover:bg-green-700"
                      >
                        Approve
                      </button>

                      <button
                        onClick={() => onReject(refund)}
                        className="rounded-lg bg-red-600 px-3 py-2 text-xs font-medium text-white transition hover:bg-red-700"
                      >
                        Reject
                      </button>
                    </div>
                  ) : (
                    <span className="text-gray-400">
                      —
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
