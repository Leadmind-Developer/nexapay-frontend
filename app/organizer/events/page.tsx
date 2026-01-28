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

/* ================= HELPERS ================= */

function isEnded(event: Event) {
  return new Date(event.endAt) < new Date();
}

/* ================= PAGE ================= */

export default function OrganizerEventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"all" | "active" | "ended">("all");

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
      ended: events.filter(isEnded).length,
      needsTickets: events.filter((e) => e.ticketTypes.length === 0).length,
    };
  }, [events]);

  const filteredEvents = useMemo(() => {
    if (tab === "active") {
      return events.filter((e) => !isEnded(e));
    }

    if (tab === "ended") {
      return events.filter(isEnded);
    }

    return events;
  }, [events, tab]);

  if (loading) return <p className="p-6">Loading dashboard...</p>;

  return (
    <main className="max-w-7xl mx-auto px-6 py-8 text-gray-900 dark:text-gray-100">

      {/* ================= TOP BAR ================= */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Organizer Dashboard</h1>
          <p className="text-gray-500 mt-1">
            Create events, add tickets, then publish.
          </p>
        </div>

        <Link
          href="/organizer/events/create"
          className="rounded-xl bg-black text-white px-5 py-2 font-medium hover:opacity-90"
        >
          + Create Event
        </Link>
      </div>

      {/* ================= STATS ================= */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-10">
        <DashboardStat label="Total" value={stats.totalEvents} />
        <DashboardStat label="Published" value={stats.published} />
        <DashboardStat label="Drafts" value={stats.drafts} />
        <DashboardStat label="Ended" value={stats.ended} />
        <DashboardStat label="Needs Tickets" value={stats.needsTickets} />
      </section>

      {/* ================= TABS ================= */}
      <div className="flex gap-2 mb-6">
        <TabButton active={tab === "all"} onClick={() => setTab("all")}>
          All Events
        </TabButton>
        <TabButton active={tab === "active"} onClick={() => setTab("active")}>
          Active
        </TabButton>
        <TabButton active={tab === "ended"} onClick={() => setTab("ended")}>
          Ended
        </TabButton>
      </div>

      {/* ================= EVENTS ================= */}
      <section>
        {filteredEvents.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredEvents.map((event) => (
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
    <div className="bg-white dark:bg-gray-800 border rounded-xl p-5 shadow-sm">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-3xl font-bold mt-1">{value}</p>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-lg text-sm font-medium border transition ${
        active
          ? "bg-black text-white border-black"
          : "bg-white dark:bg-gray-800 border-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
      }`}
    >
      {children}
    </button>
  );
}

export function EventCard({ event }: { event: Event }) {
  const [shortLink, setShortLink] = useState<string | null>(null);
  const imageUrl = getEventImage(event);
  const hasTickets = event.ticketTypes.length > 0;

  const eventLink = `${window.location.origin}/events/${event.slug}`;

  // Auto-shortened link function
  const getShortenedLink = async () => {
    if (shortLink) return shortLink; // reuse if already fetched
    try {
      const res = await fetch(
        `https://tinyurl.com/api-create.php?url=${encodeURIComponent(eventLink)}`
      );
      const shortUrl = await res.text();
      setShortLink(shortUrl);
      return shortUrl;
    } catch (err) {
      console.error("Failed to shorten URL", err);
      return eventLink; // fallback
    }
  };

  // Copy link to clipboard
  const copyLink = async () => {
    const link = await getShortenedLink();
    await navigator.clipboard.writeText(link);
    alert("Event link copied to clipboard!");
  };

  // Share via Web Share API or fallback to copy
  const handleShare = async () => {
    const link = await getShortenedLink();
    if (navigator.share) {
      try {
        await navigator.share({
          title: event.title,
          text: "Check out this event!",
          url: link,
        });
      } catch (err) {
        console.error("Share cancelled or failed", err);
      }
    } else {
      await navigator.clipboard.writeText(link);
      alert("Event link copied to clipboard!");
    }
  };

  // Check if event has ended
  const isExpired = new Date(event.endAt) < new Date();

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition">
      {/* IMAGE */}
      <div className="h-40 w-full bg-gray-100 relative">
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
        {isExpired && (
          <span className="absolute top-2 left-2 bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300 text-xs px-2 py-1 rounded-full font-medium">
            Ended
          </span>
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

        {/* SHARE ONLY IF PUBLISHED */}
        {event.published && (
          <div className="mt-4 flex gap-2">
            <button
              onClick={copyLink}
              className="flex-1 border rounded-lg py-2 text-sm hover:bg-gray-50 transition"
            >
              Copy Link
            </button>
            <button
              onClick={handleShare}
              className="flex-1 bg-white dark:bg-grey-100 text-black dark:white rounded-lg py-2 text-sm hover:opacity-90 transition"
            >
              Share
            </button>
          </div>
        )}
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
    <div className="border border-dashed rounded-xl p-10 text-center bg-gray-50">
      <h3 className="text-lg font-semibold mb-2">No events found</h3>
      <p className="text-gray-500 mb-4">
        Try creating a new event or switching tabs.
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

function getPublicEventLink(event: Event) {
  const baseUrl = window.location.origin;
  return `${baseUrl}/events/${event.slug || event.id}`;
}
