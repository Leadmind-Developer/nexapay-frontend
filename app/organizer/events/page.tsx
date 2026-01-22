"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { getEventImage } from "@/lib/getEventImage";

/* ================= TYPES ================= */

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
  images: { url: string }[];
  ticketTypes: TicketType[];
}

/* ================= PAGE ================= */

export default function OrganizerEventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<Event[]>("/events/organizer/events")
      .then((res) => setEvents(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const stats = useMemo(() => {
    return {
      totalEvents: events.length,
      published: events.filter((e) => e.published).length,
      drafts: events.filter((e) => !e.published).length,
      needsTickets: events.filter((e) => e.ticketTypes.length === 0).length,
    };
  }, [events]);

  if (loading) return <p className="p-6">Loading dashboard...</p>;

  return (
    <main className="max-w-7xl mx-auto px-6 py-8 text-gray-900 dark:text-gray-100">
      {/* ================= TOP BAR ================= */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <p className="text-gray-500 dark:text-black-300 mt-1">
          <h1 className="text-3xl font-bold">Organizer Dashboard</h1>
          <p className="text-gray-500 dark:text-black-300 mt-1">
            Create events, add tickets, then publish.            
          </p>
        </div>

        <Link
          href="/organizer/events/create"
          className="rounded-xl bg-black dark:bg-white text-white dark:text-black px-5 py-2 font-medium hover:opacity-90 transition"
        >
          + Create Event
        </Link>
      </div>

      {/* ================= STATS ================= */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <DashboardStat label="Total Events" value={stats.totalEvents} />
        <DashboardStat label="Published" value={stats.published} />
        <DashboardStat label="Drafts" value={stats.drafts} />
        <DashboardStat
          label="Needs Tickets"
          value={stats.needsTickets}
        />
      </section>

      {/* ================= EVENTS ================= */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Your Events</h2>

        {events.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

/* ================= COMPONENTS ================= */

function DashboardStat({
  label,
  value,
}: {
  label: string;
  value: number | string;
}) {
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 shadow-sm">
      <p className="text-sm text-gray-500 dark:text-gray-300">{label}</p>
      <p className="text-3xl font-bold mt-1">{value}</p>
    </div>
  );
}

function EventCard({ event }: { event: Event }) {
  const imageUrl = getEventImage(event);
  const hasTickets = event.ticketTypes.length > 0;

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition">
      {/* IMAGE */}
      <div className="h-40 w-full bg-gray-100">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={event.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-gray-400 dark:text-gray-500 text-sm bg-gray-100 dark:bg-gray-900">
            No event image
          </div>
        )}
      </div>

      {/* CONTENT */}
      <div className="p-5">
        <div className="flex items-start justify-between">
          <h3 className="text-lg font-semibold">{event.title}</h3>
          <span
            className={`text-xs px-2 py-1 rounded-full font-medium ${
              event.published
                ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300"
                : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300"
            }`}
          >
            {event.published ? "Published" : "Draft"}
          </span>
        </div>

        <p className="text-sm text-gray-500 dark:text-gray-300 mt-2">
          {new Date(event.startAt).toLocaleDateString()} •{" "}
          {new Date(event.endAt).toLocaleDateString()}
        </p>

        <div className="mt-3 text-sm text-gray-600 dark:text-gray-300">
          <p>Ticket Types: {event.ticketTypes.length}</p>
          {!hasTickets && (
            <p className="mt-1 text-red-600 dark:text-red-400 font-medium">
              Setup required: add tickets
            </p>
          )}
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
          <ActionLink href={`/organizer/events/${event.id}/edit`} label="Edit" />
          <ActionLink href={`/organizer/events/${event.id}/tickets`} label="Tickets" />
          <ActionLink href={`/organizer/events/${event.id}/attendees`} label="Attendees" />
          <ActionLink href={`/organizer/events/${event.id}/stats`} label="Stats" />
        </div>
      </div>
    </div>
  );
}

function ActionLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="flex items-center justify-center rounded-lg border border-gray-200 dark:border-gray-700 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
    >
      {label}
    </Link>
  );
}

function EmptyState() {
  return (
    <div className="border border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-10 text-center bg-gray-50 dark:bg-gray-900">
      <h3 className="text-lg font-semibold mb-2">No events yet</h3>
      <p className="text-gray-500 dark:text-gray-300 mb-4">
        Create an event, then add ticket types before publishing.
      </p>
      <Link
        href="/organizer/events/create"
        className="inline-block bg-black dark:bg-white text-white dark:text-black px-6 py-3 rounded-xl"
      >
        Create Event
      </Link>
    </div>
  );
}
