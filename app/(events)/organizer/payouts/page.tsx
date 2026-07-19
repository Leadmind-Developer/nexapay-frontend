"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";

interface PayoutHistory {
  id?: string;
  type: string;
  amount: number;
  createdAt: string;
}

interface PayoutSummary {
  balance: number;
  pending: number;
  paidOut: number;
  history: PayoutHistory[];
}

export default function OrganizerPayoutsPage() {
  const [balance, setBalance] = useState(0);
  const [pending, setPending] = useState(0);
  const [paidOut, setPaidOut] = useState(0);
  const [history, setHistory] = useState<PayoutHistory[]>([]);

  const [withdrawAmount, setWithdrawAmount] = useState("");

  const [loading, setLoading] = useState(true);
  const [withdrawing, setWithdrawing] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadPayouts = useCallback(async () => {
    try {
      setLoading(true);

      const { data } = await api.get<PayoutSummary>(
        "/payouts/organizer/payouts"
      );

      setBalance(data.balance ?? 0);
      setPending(data.pending ?? 0);
      setPaidOut(data.paidOut ?? 0);
      setHistory(data.history ?? []);
    } catch (err: any) {
      console.error(err);

      setError(
        err.response?.data?.error ??
          err.message ??
          "Failed to fetch payouts."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPayouts();
  }, [loadPayouts]);

  const handleWithdrawAll = () => {
    setWithdrawAmount(balance.toString());
    setError("");
  };

  const handleWithdraw = async () => {
    setError("");
    setSuccess("");

    const amount = Number(withdrawAmount);

    if (!withdrawAmount) {
      setError("Please enter a withdrawal amount.");
      return;
    }

    if (isNaN(amount)) {
      setError("Invalid withdrawal amount.");
      return;
    }

    if (amount <= 0) {
      setError("Withdrawal amount must be greater than zero.");
      return;
    }

    if (amount > balance) {
      setError("Withdrawal amount cannot exceed your available balance.");
      return;
    }

    try {
      setWithdrawing(true);

      await api.post("/payouts/organizer/payouts/withdraw", {
        amount,
      });

      setSuccess(
        "Withdrawal request submitted successfully. It is now awaiting approval."
      );

      setWithdrawAmount("");

      await loadPayouts();
    } catch (err: any) {
      console.error(err);

      setError(
        err.response?.data?.error ??
          err.message ??
          "Withdrawal request failed."
      );
    } finally {
      setWithdrawing(false);
    }
  };

  return (
    <main className="max-w-6xl mx-auto px-6 py-8">
      {/* Header */}

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Payouts</h1>
          <p className="text-gray-500 mt-1">
            View earnings and manage withdrawals.
          </p>
        </div>

        <Link
          href="/organizer/events"
          className="text-sm font-medium text-gray-600 hover:underline"
        >
          ← Back to dashboard
        </Link>
      </div>

      {/* Summary */}

      <section className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
        <BalanceCard
          label="Available Balance"
          value={balance}
          highlight
        />

        <BalanceCard
          label="Pending Withdrawals"
          value={pending}
        />

        <BalanceCard
          label="Total Paid Out"
          value={paidOut}
        />
      </section>

      {/* Withdraw */}

      <section className="bg-white border rounded-xl p-6 mb-10">
        <h2 className="text-lg font-semibold">
          Withdraw Funds
        </h2>

        <p className="text-gray-500 text-sm mt-1 mb-6">
          Withdrawals are sent to your registered bank account after
          approval.
        </p>

        <div className="bg-gray-50 border rounded-lg p-4 mb-6">
          <p className="text-sm text-gray-500">
            Available Balance
          </p>

          <p className="text-3xl font-bold mt-1">
            ₦{balance.toLocaleString()}
          </p>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium">
            Withdrawal Amount
          </label>

          <div className="flex gap-3">
            <input
              type="number"
              min={1}
              max={balance}
              value={withdrawAmount}
              onChange={(e) => {
                setWithdrawAmount(e.target.value);
                setError("");
                setSuccess("");
              }}
              placeholder="Enter amount"
              className="flex-1 rounded-xl border px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black"
            />

            <button
              type="button"
              onClick={handleWithdrawAll}
              disabled={balance <= 0}
              className="px-5 rounded-xl border hover:bg-gray-100 disabled:opacity-40"
            >
              Withdraw All
            </button>
          </div>

          <p className="text-xs text-gray-500">
            Maximum withdrawal:
            {" "}
            <strong>₦{balance.toLocaleString()}</strong>
          </p>
        </div>

        {error && (
          <div className="mt-5 rounded-lg bg-red-50 border border-red-200 p-3 text-red-600 text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="mt-5 rounded-lg bg-green-50 border border-green-200 p-3 text-green-700 text-sm">
            {success}
          </div>
        )}

        <div className="mt-6">
          <button
            onClick={handleWithdraw}
            disabled={
              withdrawing ||
              balance <= 0 ||
              !withdrawAmount
            }
            className={`px-6 py-3 rounded-xl font-medium transition ${
              withdrawing ||
              balance <= 0 ||
              !withdrawAmount
                ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                : "bg-black text-white hover:bg-gray-900"
            }`}
          >
            {withdrawing
              ? "Submitting Request..."
              : "Request Withdrawal"}
          </button>
        </div>
      </section>

      {/* History */}

      <section>
        <h2 className="text-lg font-semibold mb-4">
          Payout History
        </h2>

        {loading ? (
          <div className="text-center text-gray-500 py-10">
            Loading payouts...
          </div>
        ) : history.length === 0 ? (
          <div className="border border-dashed rounded-xl p-10 text-center">
            <p className="text-gray-500">
              No payout history available.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {history.map((item, index) => (
              <div
                key={item.id ?? index}
                className="border rounded-xl p-5 flex items-center justify-between"
              >
                <div>
                  <p className="font-semibold">
                    {item.type.replace(/_/g, " ")}
                  </p>

                  <p className="text-sm text-gray-500 mt-1">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <p className="font-bold text-lg">
                  ₦{item.amount.toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

function BalanceCard({
  label,
  value,
  highlight,
}: {
  label: string;
  value: number;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border p-5 ${
        highlight
          ? "bg-black text-white border-black"
          : "bg-white"
      }`}
    >
      <p
        className={`text-sm ${
          highlight ? "text-gray-300" : "text-gray-500"
        }`}
      >
        {label}
      </p>

      <p className="text-3xl font-bold mt-2">
        ₦{value.toLocaleString()}
      </p>
    </div>
  );
}
