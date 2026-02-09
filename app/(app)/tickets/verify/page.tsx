"use client";

import { useState } from "react";
import api from "@/lib/api";

interface TicketResult {
  code: string;
  checkedAt?: string | null;
  checkedIn: boolean;
  canCheckIn: boolean;
  status: "ACTIVE" | "CHECKED_IN" | "REVOKED";
  event: {
    title: string;
  };
  buyer?: {
    name?: string;
    email?: string;
    phone?: string;
  };
}

export default function VerifyTicketPage() {
  const [code, setCode] = useState("");
  const [ticket, setTicket] = useState<TicketResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [checkingIn, setCheckingIn] = useState(false);
  const [revoking, setRevoking] = useState(false);
  const [confirmRevoke, setConfirmRevoke] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  function showToast(message: string) {
    setToast(message);
    setTimeout(() => setToast(null), 2500);
  }

  function normalizeTicket(data: any): TicketResult {
    const status = data.status || (data.checkedIn ? "CHECKED_IN" : "ACTIVE");
    return {
      code: data.code,
      checkedIn: status === "CHECKED_IN",
      checkedAt: data.checkedAt || null,
      canCheckIn: status === "ACTIVE",
      status,
      event: { title: data.event?.title || "Event" },
      buyer: data.buyer || undefined,
    };
  }

  async function handleVerify() {
    if (!code) return;
    setLoading(true);
    setError(null);
    setTicket(null);

    try {
      const res = await api.post("/events/tickets/verify", { code });
      setTicket(normalizeTicket(res.data));
    } catch (err: any) {
      setError(err.response?.data?.error || "Invalid ticket");
    } finally {
      setLoading(false);
    }
  }

  async function handleCheckIn() {
    if (!code || !ticket) return;
    setCheckingIn(true);
    setError(null);

    try {
      const res = await api.post("/events/tickets/checkin", { code });
      setTicket(normalizeTicket(res.data));
      showToast("✅ Ticket checked in successfully!");
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to check in");
    } finally {
      setCheckingIn(false);
    }
  }

  async function handleRevoke() {
    if (!code) return;
    setRevoking(true);
    setError(null);

    try {
      await api.post(`/tickets/${code}/revoke`, {
        reason: "manual_revoke",
      });
      setTicket((t) =>
        t ? { ...t, status: "REVOKED", checkedIn: false, canCheckIn: false } : t
      );
      setConfirmRevoke(false);
      showToast("✅ Ticket revoked successfully!");
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to revoke ticket");
    } finally {
      setRevoking(false);
    }
  }

  return (
    <div className="relative max-w-md mx-auto mt-20 p-6 border rounded-xl shadow-sm bg-white dark:bg-gray-900">

      {/* TOAST */}
      {toast && (
        <div className="absolute -top-14 left-1/2 -translate-x-1/2 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg animate-bounce">
          {toast}
        </div>
      )}

      <h1 className="text-2xl font-bold mb-4 text-center">Ticket Verification</h1>

      <input
        type="text"
        placeholder="Enter ticket code"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        className="w-full border px-3 py-2 rounded-lg mb-4 dark:bg-gray-800 dark:border-gray-700"
      />

      <button
        onClick={handleVerify}
        disabled={loading}
        className="w-full bg-black text-white py-2 rounded-lg hover:opacity-90 disabled:opacity-60"
      >
        {loading ? "Verifying..." : "Verify Ticket"}
      </button>

      {error && (
        <p className="mt-4 text-center text-red-600 font-medium">{error}</p>
      )}

      {ticket && (
        <div className="mt-6 p-4 rounded-lg border dark:border-gray-700">
          <p className="font-semibold text-lg mb-1">🎉 {ticket.event.title}</p>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">Code: {ticket.code}</p>

          {ticket.checkedIn ? (
            <span className="inline-block bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-medium">
              Already Checked In
            </span>
          ) : ticket.status === "REVOKED" ? (
            <span className="inline-block bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium">
              Revoked
            </span>
          ) : (
            <span className="inline-block bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
              Valid Ticket
            </span>
          )}

          {!ticket.checkedIn && ticket.canCheckIn && (
            <>
              <button
                onClick={handleCheckIn}
                disabled={checkingIn}
                className="mt-4 w-full py-2 rounded-lg bg-green-600 text-white hover:opacity-90 disabled:opacity-60"
              >
                {checkingIn ? "Checking in..." : "Check In Ticket"}
              </button>

              {/* REVOKE */}
              <button
                onClick={() => setConfirmRevoke(true)}
                className="mt-3 w-full py-2 rounded-lg border border-red-600 text-red-600 hover:bg-red-50"
              >
                Revoke Ticket
              </button>
            </>
          )}

          {confirmRevoke && (
            <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
              <div className="bg-white dark:bg-gray-900 p-6 rounded-xl w-full max-w-sm shadow-lg">
                <h3 className="text-lg font-bold mb-2 text-red-600">Revoke Ticket?</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                  This action will invalidate the ticket and free up a slot. This cannot be undone.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setConfirmRevoke(false)}
                    className="flex-1 border rounded-lg py-2"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleRevoke}
                    disabled={revoking}
                    className="flex-1 bg-red-600 text-white rounded-lg py-2 hover:opacity-90 disabled:opacity-60"
                  >
                    {revoking ? "Revoking…" : "Yes, Revoke"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
