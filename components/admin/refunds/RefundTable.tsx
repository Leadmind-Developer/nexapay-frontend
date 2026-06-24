// components/admin/refunds/RefundTable.tsx

"use client";

import { Refund } from "./types";

interface Props {
  refunds: Refund[];
  onApprove: (refund: Refund) => void;
  onReject: (refund: Refund) => void;
}

export default function RefundTable({
  refunds,
  onApprove,
  onReject,
}: Props) {
  return (
    <table className="w-full border">
      <thead>
        <tr>
          <th>User</th>
          <th>Amount</th>
          <th>Source</th>
          <th>Status</th>
          <th />
        </tr>
      </thead>

      <tbody>
        {refunds.map((refund) => (
          <tr key={refund.id}>
            <td>
              {refund.user?.firstName}{" "}
              {refund.user?.lastName}
            </td>

            <td>
              ₦
              {(refund.amount / 100).toLocaleString()}
            </td>

            <td>
              {refund.sourceType}
            </td>

            <td>{refund.status}</td>

            <td className="space-x-2">
              {refund.status ===
                "PENDING" && (
                <>
                  <button
                    onClick={() =>
                      onApprove(refund)
                    }
                  >
                    Approve
                  </button>

                  <button
                    onClick={() =>
                      onReject(refund)
                    }
                  >
                    Reject
                  </button>
                </>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
