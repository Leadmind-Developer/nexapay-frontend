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
  const params = useParams();
  const eventId = params.id;

  const [stats, setStats] = useState<EventStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!eventId) return; // guard against undefined

    setLoading(true);
    api
      .get<EventStats>(`/organizer/events/${eventId}/stats`)
      .then((res) => setStats(res.data))
      .catch((err) => {
        console.error(err);
        setStats(null);
      })
      .finally(() => setLoading(false));
  }, [eventId]);

  if (loading) return <p className="p-4">Loading stats...</p>;
  if (!stats) return <p className="p-4 text-red-500">Stats not found</p>;

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Event Stats</h1>
      <div className="space-y-2">
        <p>Total Revenue: ₦{stats.totalRevenue.toLocaleString()}</p>
        <p>Tickets Sold: {stats.ticketsSold}</p>
        <p>Capacity: {stats.capacity}</p>
      </div>
    </div>
  );
}
