// app/(admin)/refunds/page.tsx

"use client";

import { useEffect, useState } from "react";

import { Refund } from "@/components/admin/refunds/types";

import RefundTable
  from "@/components/admin/refunds/RefundTable";

import RefundFormModal
  from "@/components/admin/refunds/RefundFormModal";

import ApproveRefundDialog
  from "@/components/admin/refunds/ApproveRefundDialog";

import { RefundAPI } from "@/lib/refunds";

export default function RefundsPage() {
  const [refunds, setRefunds] =
    useState<Refund[]>([]);

  const [showCreate, setShowCreate] =
    useState(false);

  const [selectedRefund,
    setSelectedRefund] =
      useState<Refund | null>(null);

  async function loadRefunds() {
  try {
    const res = await RefundAPI.list();

    console.log("REFUNDS:", res.data);

    setRefunds(res.data.data || []);
  } catch (err: any) {
    console.error(
      "Refund loading failed:",
      err.response?.data || err.message
    );

    setRefunds([]);
  }
}

  useEffect(() => {
    loadRefunds();
  }, []);

  return (
    <div className="p-6">
      <div className="flex justify-between mb-6">
        <h1 className="text-2xl font-bold">
          Refund Management
        </h1>

        <button
          onClick={() =>
            setShowCreate(true)
          }
          className="bg-[#39358c] text-white px-4 py-2 rounded"
        >
          Create Refund
        </button>
      </div>

      <RefundTable
        refunds={refunds}
        onApprove={(refund) =>
          setSelectedRefund(refund)
        }
        onReject={async (refund) => {
          const reason =
            prompt(
              "Reason for rejection"
            );

          await RefundAPI.reject(
            refund.id,
            reason || ""
          );

          loadRefunds();
        }}
      />

      <RefundFormModal
        open={showCreate}
        onClose={() =>
          setShowCreate(false)
        }
        onSuccess={loadRefunds}
      />

      <ApproveRefundDialog
        refund={selectedRefund}
        onClose={() =>
          setSelectedRefund(null)
        }
        onSuccess={loadRefunds}
      />
    </div>
  );
}
