"use client";

import { useState } from "react";
import api from "@/lib/api";

interface TicketResult {
  code: string;
  checkedInAt?: string | null;
  event: {
    title: string;
  };
}

export default function VerifyTicketPage() {
  const [code, setCode] = useState("");
  const [ticket, setTicket] = useState<TicketResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [checkingIn, setCheckingIn] = useState(false);

  async function handleVerify() {
    if (!code) return;

    setLoading(true);
    setError(null);
    setTicket(null);

    try {
      const res = await api.post("/events/tickets/verify", { code });
      setTicket(res.data);
    } catch (err: any) {
      setError(err.response?.data?.error || "Invalid ticket");
    } finally {
      setLoading(false);
    }
  }

  async function handleCheckIn() {
    if (!code) return;

    setCheckingIn(true);
    try {
      const res = await api.post("/events/tickets/check-in", { code });
      setTicket(res.data);
    } catch (err: any) {
      alert(err.response?.data?.error || "Failed to check in");
    } finally {
      setCheckingIn(false);
    }
  }

  return (
    <div className="max-w-md mx-auto mt-20 p-6 border rounded-xl shadow-sm bg-white dark:bg-gray-900">

      <h1 className="text-2xl font-bold mb-4 text-center">
        Ticket Verification
      </h1>

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
        className="w-full bg-black text-white py-2 rounded-lg hover:opacity-90"
      >
        {loading ? "Verifying..." : "Verify Ticket"}
      </button>

      {/* ERROR */}
      {error && (
        <p className="mt-4 text-center text-red-600 font-medium">
          {error}
        </p>
      )}

      {/* RESULT */}
      {ticket && (
        <div className="mt-6 p-4 rounded-lg border dark:border-gray-700">

          <p className="font-semibold text-lg mb-1">
            🎉 {ticket.event.title}
          </p>

          <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
            Code: {ticket.code}
          </p>

          {ticket.checkedInAt ? (
            <span className="inline-block bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-medium">
              Already Checked In
            </span>
          ) : (
            <span className="inline-block bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
              Valid Ticket
            </span>
          )}

          {/* ORGANIZER ACTION */}
          {!ticket.checkedInAt && (
            <button
              onClick={handleCheckIn}
              disabled={checkingIn}
              className="mt-4 w-full bg-green-600 text-white py-2 rounded-lg hover:opacity-90"
            >
              {checkingIn ? "Checking in..." : "Check In Ticket"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
