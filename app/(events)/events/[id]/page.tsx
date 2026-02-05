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

async function getEvent(id: string): Promise<Event | null> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/events/${id}`, {
    cache: "no-store",
  });

  if (!res.ok) return null;

  return res.json();
  } catch {
    return null;
  }
}

/* ================= SEO METADATA ================= */

export async function generateMetadata({ params }: { params: { id: string } }) {
  const event = await getEvent(params.id);

  return {
    title: `${event.title} | Nexa Events`,
    description: event.description.slice(0, 160),

    openGraph: {
      title: event.title,
      description: event.description,
      images: event.images?.[0]?.url ? [event.images[0].url] : [],
    },
  };
}

/* ================= PAGE ================= */

export default async function EventPage({ params }: { params: { id: string } }) {
  const event = await getEvent(params.id);

  return (
    <>
      {/* Google Rich Results */}
      <EventStructuredData event={event} />

      {/* Client UI */}
      <EventClient />
    </>
  );
}
