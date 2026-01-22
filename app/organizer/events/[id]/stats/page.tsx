"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import api from "@/lib/api";

interface EventStats {
  totalRevenue: number;
  ticketsSold: number;
  capacity: number;
}

export default function StatsPage() {
  const { id: eventId } = useParams<{ id: string }>();

  const [stats, setStats] = useState<EventStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!eventId) return;

    api
      .get<EventStats>(`/events/organizer/events/${eventId}/stats`)
      .then((res) => setStats(res.data))
      .catch(() => setStats(null))
      .finally(() => setLoading(false));
  }, [eventId]);

  if (loading)
    return <p className="p-4 text-gray-500 dark:text-gray-400">Loading stats…</p>;

  if (!stats)
    return (
      <p className="p-4 text-gray-500 dark:text-gray-400">
        Stats unavailable. Add ticket types and make sales.
      </p>
    );

  return (
    <div className="max-w-3xl mx-auto p-6 text-gray-900 dark:text-gray-100">
      <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
        Event Stats
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Stat label="Revenue" value={`₦${stats.totalRevenue.toLocaleString()}`} />
        <Stat label="Tickets Sold" value={stats.ticketsSold} />
        <Stat label="Capacity" value={stats.capacity} />
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-5 bg-white dark:bg-gray-800">
      <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
      <p className="text-2xl font-bold mt-1 text-gray-900 dark:text-white">
        {value}
      </p>
    </div>
  );
}
