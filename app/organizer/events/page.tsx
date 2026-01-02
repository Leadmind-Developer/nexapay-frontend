"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";

interface TicketType {
  id: string;
  name: string;
  price: number;
}

interface Event {
  id: string;
  title: string;
  slug: string;
  startAt: string;
  endAt: string;
  published: boolean;
  ticketTypes: TicketType[];
}

export default function OrganizerEventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<Event[]>("/organizer/events")
      .then((res) => setEvents(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const stats = useMemo(() => {
    let revenue = 0;
    let ticketsSold = 0;

   events.forEach(event => {
    // SAFE placeholders – backend can fill later
    // @ts-ignore
    if (event.stats?.totalRevenue) {
      // @ts-ignore
      revenue += event.stats.totalRevenue;
    }
    // @ts-ignore
    if (event.stats?.ticketsSold) {
      // @ts-ignore
      ticketsSold += event.stats.ticketsSold;
    }
  })
    return {
      totalEvents: events.length,
      published: events.filter(e => e.published).length,
      drafts: events.filter(e => !e.published).length,
      revenue,
      ticketsSold
    };
  }, [events]);

  if (loading) return <p className="p-6">Loading dashboard...</p>;

  return (
    <main className="max-w-7xl mx-auto px-6 py-8">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Events Dashboard</h1>
          <p className="text-gray-500 mt-1">
            Create events, manage tickets, and track performance.
          </p>
        </div>

        <Link
          href="/organizer/events/create"
          className="mt-4 md:mt-0 inline-flex items-center justify-center bg-black text-white px-5 py-3 rounded-xl font-medium hover:opacity-90"
        >
          + Create Event
        </Link>
      </div>

      {/* STATS */}
  <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
   <DashboardStat
    label="Total Events"
    value={stats.totalEvents}
  />
  <DashboardStat
    label="Published Events"
    value={stats.published}
  />
  <DashboardStat
    label="Tickets Sold"
    value={stats.ticketsSold || "—"}
  />
  <DashboardStat
    label="Revenue"
    value={
      stats.revenue
        ? `₦${stats.revenue.toLocaleString()}`
        : "—"
    }
  />
</section>

      {/* EVENTS */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Your Events</h2>

        {events.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {events.map(event => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

/* ---------------- COMPONENTS ---------------- */

function DashboardStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-white border rounded-xl p-5 shadow-sm">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-3xl font-bold mt-1">{value}</p>
    </div>
  );
}

function EventCard({ event }: { event: Event }) {
  return (
    <div className="bg-white border rounded-xl p-5 shadow-sm hover:shadow-md transition">
      <div className="flex items-start justify-between">
        <h3 className="text-lg font-semibold">{event.title}</h3>
        <span
          className={`text-xs px-2 py-1 rounded-full ${
            event.published
              ? "bg-green-100 text-green-700"
              : "bg-yellow-100 text-yellow-700"
          }`}
        >
          {event.published ? "Published" : "Draft"}
        </span>
      </div>

      <p className="text-sm text-gray-500 mt-2">
        {new Date(event.startAt).toLocaleDateString()} •{" "}
        {new Date(event.endAt).toLocaleDateString()}
      </p>

      <p className="text-sm text-gray-500 mt-1">
        Ticket Types: {event.ticketTypes.length}
      </p>

      <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
        <ActionLink href={`/organizer/events/${event.id}/edit`} label="Edit" />
        <ActionLink href={`/organizer/events/${event.id}/tickets`} label="Tickets" />
        <ActionLink href={`/organizer/events/${event.id}/attendees`} label="Attendees" />
        <ActionLink href={`/organizer/events/${event.id}/stats`} label="Stats" />
      </div>
    </div>
  );
}

function ActionLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="flex items-center justify-center rounded-lg border py-2 hover:bg-gray-50 transition"
    >
      {label}
    </Link>
  );
}

function EmptyState() {
  return (
    <div className="border border-dashed rounded-xl p-10 text-center">
      <h3 className="text-lg font-semibold mb-2">No events yet</h3>
      <p className="text-gray-500 mb-4">
        Get started by creating your first event.
      </p>
      <Link
        href="/organizer/events/create"
        className="inline-block bg-black text-white px-6 py-3 rounded-xl"
      >
        Create Event
      </Link>
    </div>
  );
}
