// app/(admin)/refunds/page.tsx

"use client";

import { useEffect, useState } from "react";

import { Refund } from "@/components/admin/refunds/types";

import RefundTable from "@/components/admin/refunds/RefundTable";
import RefundCandidatesTable from "@/components/admin/refunds/RefundCandidatesTable";
import ApproveRefundDialog from "@/components/admin/refunds/ApproveRefundDialog";

import { RefundAPI } from "@/lib/refunds";

export default function RefundsPage() {
  const [refunds, setRefunds] = useState<Refund[]>([]);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [selectedRefund, setSelectedRefund] =
    useState<Refund | null>(null);

  async function loadRefunds() {
    try {
      const res = await RefundAPI.list();

      setRefunds(res.data.data || []);
    } catch (err: any) {
      console.error(
        "Refund loading failed:",
        err.response?.data || err.message
      );

      setRefunds([]);
    }
  }

  async function loadCandidates() {
    try {
      const res = await RefundAPI.candidates();

      setCandidates(res.data.data || []);
    } catch (err: any) {
      console.error(
        "Candidate loading failed:",
        err.response?.data || err.message
      );

      setCandidates([]);
    }
  }

  useEffect(() => {
    loadRefunds();
    loadCandidates();
  }, []);

  async function queueRefund(transactionId: string) {
    try {
      await RefundAPI.create(transactionId);

      await loadCandidates();
      await loadRefunds();
    } catch (err: any) {
      alert(
        err.response?.data?.message ||
          "Unable to queue refund."
      );
    }
  }

  async function rejectRefund(refund: Refund) {
    const reason =
      prompt("Reason for rejection") || "";

    if (!reason) return;

    try {
      await RefundAPI.reject(
        refund.id,
        reason
      );

      await loadRefunds();
    } catch (err: any) {
      alert(
        err.response?.data?.message ||
          "Unable to reject refund."
      );
    }
  }

  return (
    <div className="p-6 space-y-10">
      <h1 className="text-2xl font-bold">
        Refund Management
      </h1>

      {/* Refund Queue */}

      <section>
        <h2 className="text-xl font-bold mb-4">
          Refund Candidates
        </h2>

        <RefundCandidatesTable
          candidates={candidates}
          onQueue={queueRefund}
        />
      </section>

      {/* Refund History */}

      <section>
        <h2 className="text-xl font-bold mb-4">
          Refund History
        </h2>

        <RefundTable
          refunds={refunds}
          onApprove={(refund) =>
            setSelectedRefund(refund)
          }
          onReject={rejectRefund}
        />
      </section>

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
