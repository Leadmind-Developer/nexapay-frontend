// app/(admin)/refunds/page.tsx

"use client";

import { useEffect, useMemo, useState } from "react";

import { Refund } from "@/components/admin/refunds/types";

import RefundTable from "@/components/admin/refunds/RefundTable";
import RefundCandidatesTable from "@/components/admin/refunds/RefundCandidatesTable";
import ApproveRefundDialog from "@/components/admin/refunds/ApproveRefundDialog";

import { RefundAPI } from "@/lib/refunds";

interface RefundCandidate {
  id: string;
  amount: number;
  requestId: string;
  serviceID: string;
  status: string;
  createdAt: string;
  phone?: string;
  meterNumber?: string;

  user: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export default function RefundsPage() {
  const [refunds, setRefunds] = useState<Refund[]>([]);
  const [candidates, setCandidates] = useState<RefundCandidate[]>([]);
  const [selectedRefund, setSelectedRefund] =
    useState<Refund | null>(null);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] =
    useState(false);

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

  async function refreshAll(showLoader = false) {
    try {
      if (showLoader) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      await Promise.all([
        loadRefunds(),
        loadCandidates(),
      ]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    refreshAll(true);
  }, []);

  async function queueRefund(
    transactionId: string
  ) {
    try {
      await RefundAPI.create(transactionId);

      await refreshAll();
    } catch (err: any) {
      alert(
        err.response?.data?.message ||
          "Unable to queue refund."
      );
    }
  }

  async function rejectRefund(
    refund: Refund
  ) {
    const reason =
      prompt("Reason for rejection")?.trim() ||
      "";

    if (!reason) return;

    try {
      await RefundAPI.reject(
        refund.id,
        reason
      );

      await refreshAll();
    } catch (err: any) {
      alert(
        err.response?.data?.message ||
          "Unable to reject refund."
      );
    }
  }

  const stats = useMemo(() => {
    const pending = refunds.filter(
      (r) => r.status === "PENDING"
    ).length;

    const completed = refunds.filter(
      (r) => r.status === "COMPLETED"
    ).length;

    const rejected = refunds.filter(
      (r) => r.status === "REJECTED"
    ).length;

    return {
      pending,
      completed,
      rejected,
      candidates: candidates.length,
    };
  }, [refunds, candidates]);

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-72 rounded bg-gray-200" />

          <div className="grid gap-4 md:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-28 rounded-xl bg-gray-200"
              />
            ))}
          </div>

          <div className="h-96 rounded-xl bg-gray-200" />
          <div className="h-96 rounded-xl bg-gray-200" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6">

      {/* Header */}

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Refund Management
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Manage failed VTpass
            transactions, queue refunds,
            approve wallet credits and review
            refund history.
          </p>
        </div>

        <button
          onClick={() => refreshAll()}
          disabled={refreshing}
          className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium shadow-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {refreshing
            ? "Refreshing..."
            : "Refresh"}
        </button>
      </div>

      {/* Dashboard Cards */}

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">

        <StatCard
          title="Pending Refunds"
          value={stats.pending}
          color="amber"
        />

        <StatCard
          title="Completed"
          value={stats.completed}
          color="green"
        />

        <StatCard
          title="Rejected"
          value={stats.rejected}
          color="red"
        />

        <StatCard
          title="Refund Candidates"
          value={stats.candidates}
          color="blue"
        />
      </div>

      {/* Candidates */}

      <section className="space-y-4">

        <div className="flex items-center justify-between">

          <div>
            <h2 className="text-xl font-semibold">
              Refund Candidates
            </h2>

            <p className="text-sm text-gray-500">
              Failed VTpass transactions
              awaiting refund review.
            </p>
          </div>

          <span className="rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700">
            {candidates.length} Candidate
            {candidates.length !== 1 && "s"}
          </span>
        </div>

        {candidates.length === 0 ? (
          <EmptyState
            title="No refund candidates"
            description="There are currently no failed VTpass transactions awaiting refund."
          />
        ) : (
          <RefundCandidatesTable
            candidates={candidates}
            onQueue={queueRefund}
          />
        )}
      </section>

      {/* History */}

      <section className="space-y-4">

        <div className="flex items-center justify-between">

          <div>
            <h2 className="text-xl font-semibold">
              Refund History
            </h2>

            <p className="text-sm text-gray-500">
              Review all refund requests and
              approvals.
            </p>
          </div>

          <span className="rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700">
            {refunds.length} Record
            {refunds.length !== 1 && "s"}
          </span>
        </div>

        {refunds.length === 0 ? (
          <EmptyState
            title="No refunds found"
            description="Refund history will appear here after refunds are created."
          />
        ) : (
          <RefundTable
            refunds={refunds}
            onApprove={setSelectedRefund}
            onReject={rejectRefund}
          />
        )}
      </section>

      <ApproveRefundDialog
        refund={selectedRefund}
        onClose={() =>
          setSelectedRefund(null)
        }
        onSuccess={() => refreshAll()}
      />
    </div>
  );
}

interface CardProps {
  title: string;
  value: number;
  color:
    | "blue"
    | "green"
    | "amber"
    | "red";
}

function StatCard({
  title,
  value,
  color,
}: CardProps) {
  const colors = {
    blue: "bg-blue-50 text-blue-700",
    green: "bg-green-50 text-green-700",
    amber: "bg-amber-50 text-amber-700",
    red: "bg-red-50 text-red-700",
  };

  return (
    <div className="rounded-2xl border bg-white p-6 shadow-sm">
      <div
        className={`inline-flex rounded-lg px-3 py-1 text-xs font-semibold ${colors[color]}`}
      >
        {title}
      </div>

      <div className="mt-4 text-4xl font-bold">
        {value.toLocaleString()}
      </div>
    </div>
  );
}

interface EmptyStateProps {
  title: string;
  description: string;
}

function EmptyState({
  title,
  description,
}: EmptyStateProps) {
  return (
    <div className="rounded-2xl border border-dashed bg-white px-8 py-14 text-center">
      <h3 className="text-lg font-semibold text-gray-900">
        {title}
      </h3>

      <p className="mt-2 text-sm text-gray-500">
        {description}
      </p>
    </div>
  );
}
