// app/(admin)/manualcredit/page.tsx

"use client";

import { useState } from "react";
import { ManualCreditAPI } from "@/lib/manualcredit";

interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  userID: string;
}

export default function ManualCreditPage() {
  const [identifier, setIdentifier] = useState("");
  const [amount, setAmount] = useState("");
  const [narration, setNarration] = useState("Manual wallet credit");

  const [user, setUser] = useState<User | null>(null);

  const [searching, setSearching] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function lookupUser() {
    if (!identifier.trim()) {
      alert("Enter username or email.");
      return;
    }

    try {
      setSearching(true);

      const res = await ManualCreditAPI.lookup(identifier);

      if (!res.data.success) {
        setUser(null);
        alert(res.data.message || "User not found");
        return;
      }

      setUser(res.data.user);
    } catch (err: any) {
      setUser(null);

      alert(
        err.response?.data?.message ||
          "Unable to lookup user."
      );
    } finally {
      setSearching(false);
    }
  }

  async function creditWallet() {
    if (!user) {
      alert("Lookup a user first.");
      return;
    }

    const naira = Number(amount);

    if (!naira || naira <= 0) {
      alert("Enter a valid amount.");
      return;
    }

    if (
      !confirm(
        `Credit ₦${naira.toLocaleString()} to ${user.firstName} ${user.lastName}?`
      )
    ) {
      return;
    }

    try {
      setSubmitting(true);

      await ManualCreditAPI.credit({
        identifier,
        amount: naira * 100, // KOBO
        narration,
      });

      alert("Wallet credited successfully.");

      setAmount("");
      setNarration("Manual wallet credit");
      setIdentifier("");
      setUser(null);
    } catch (err: any) {
      alert(
        err.response?.data?.message ||
          "Credit failed."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8 p-8">

      <div>
        <h1 className="text-3xl font-bold">
          Manual Wallet Credit
        </h1>

        <p className="mt-2 text-sm text-gray-500">
          Search a user by email or username and
          manually credit their wallet.
        </p>
      </div>

      <div className="rounded-2xl border bg-white p-6 shadow-sm">

        <div className="space-y-6">

          {/* Lookup */}

          <div>

            <label className="mb-2 block text-sm font-medium">
              Email or Username
            </label>

            <div className="flex gap-3">

              <input
                className="flex-1 rounded-lg border px-4 py-3"
                placeholder="user@email.com or username"
                value={identifier}
                onChange={(e) =>
                  setIdentifier(e.target.value)
                }
              />

              <button
                onClick={lookupUser}
                disabled={searching}
                className="rounded-lg bg-blue-600 px-5 py-3 font-medium text-white hover:bg-blue-700 disabled:opacity-60"
              >
                {searching
                  ? "Searching..."
                  : "Lookup"}
              </button>

            </div>

          </div>

          {/* User */}

          {user && (
            <div className="rounded-xl border bg-green-50 p-5">

              <h2 className="mb-4 font-semibold text-green-700">
                User Found
              </h2>

              <div className="grid gap-3 md:grid-cols-2">

                <Info
                  label="Full Name"
                  value={`${user.firstName} ${user.lastName}`}
                />

                <Info
                  label="Username"
                  value={user.userID}
                />

                <Info
                  label="Email"
                  value={user.email}
                />

                <Info
                  label="User ID"
                  value={String(user.id)}
                />

              </div>

            </div>
          )}

          {/* Amount */}

          {user && (
            <>
              <div>

                <label className="mb-2 block text-sm font-medium">
                  Amount (₦)
                </label>

                <input
                  type="number"
                  min="1"
                  className="w-full rounded-lg border px-4 py-3"
                  placeholder="5000"
                  value={amount}
                  onChange={(e) =>
                    setAmount(e.target.value)
                  }
                />

              </div>

              <div>

                <label className="mb-2 block text-sm font-medium">
                  Narration
                </label>

                <input
                  className="w-full rounded-lg border px-4 py-3"
                  value={narration}
                  onChange={(e) =>
                    setNarration(e.target.value)
                  }
                />

              </div>

              <button
                onClick={creditWallet}
                disabled={submitting}
                className="w-full rounded-xl bg-green-600 py-4 text-lg font-semibold text-white hover:bg-green-700 disabled:opacity-60"
              >
                {submitting
                  ? "Crediting..."
                  : "Credit Wallet"}
              </button>
            </>
          )}

        </div>

      </div>
    </div>
  );
}

function Info({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wide text-gray-500">
        {label}
      </div>

      <div className="font-semibold">
        {value}
      </div>
    </div>
  );
}
