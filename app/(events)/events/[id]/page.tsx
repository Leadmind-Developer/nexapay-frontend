import EventClient from "./EventClient";
import EventStructuredData from "@/components/seo/EventStructuredData";

interface Event {
  id: string;
  title: string;
  description: string;
  startAt: string;
  endAt: string;
  type: "PHYSICAL" | "VIRTUAL";
  address?: string;
  city?: string;
  country?: string;
  category?: string;
  organizer: { name: string };
  images?: { url: string }[];
  ticketTypes: { price: number }[];
}

/* ================= FETCH EVENT BY SLUG (SERVER) ================= */

async function getEventBySlug(slug: string): Promise<Event | null> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE}/events?slug=${slug}`,
      {
        cache: "no-store",
      }
    );

    if (!res.ok) return null;

    const data = await res.json();

    // Assuming your API returns an array
    if (Array.isArray(data) && data.length > 0) {
      return data[0];
    }

    return null;
  } catch (error) {
    console.error("SEO fetch failed:", error);
    return null;
  }
}

/* ================= SEO METADATA ================= */

export async function generateMetadata({ params }: { params: { id: string } }) {
  const event = await getEventBySlug(params.id);

  if (!event) {
    return {
      title: "Event | Nexa Events",
      description: "Discover amazing events on Nexa Events",
    };
  }

  return {
    title: `${event.title} | Nexa Events`,
    description: event.description?.slice(0, 160) || "",
    openGraph: {
      title: event.title,
      description: event.description,
      images: event.images?.[0]?.url ? [event.images[0].url] : [],
      type: "event",
    },
  };
}

/* ================= PAGE ================= */

export default async function EventPage({ params }: { params: { id: string } }) {
  const event = await getEventBySlug(params.id);

  if (!event) {
    return (
      <div className="p-10 text-center text-gray-500">
        Event not found
      </div>
    );
  }

  return (
    <>
      <EventStructuredData event={event} />
      <EventClient />
    </>
  );
}
