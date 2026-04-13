import EventsClient from "./EventsClient";

export const metadata = {
  title: "Discover Events Near You | Nexa",
  description:
    "Browse concerts, workshops, conferences, parties and more events happening near you.",
};

async function getEvents() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/events?limit=50`, {
      cache: "no-store", // or 'force-cache' if you want caching
    });

    if (!res.ok) return [];

    return res.json();
  } catch {
    return [];
  }
}

export default async function EventsPage() {
  const initialEvents = await getEvents();

  return <EventsClient initialEvents={initialEvents} />;
}
