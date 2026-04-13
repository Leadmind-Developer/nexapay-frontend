import EventsClient from "./EventsClient";
import api from "@/lib/api";

export const metadata = {
  title: "Discover Events Near You | Nexa",
  description:
    "Browse concerts, workshops, conferences, parties and more events happening near you.",
};

async function getEvents() {
  try {
    const res = await api.get("/events", {
      params: { limit: 50 },
    });

    return res.data;
  } catch (err) {
    console.error("SSR error:", err);
    return [];
  }
}

export default async function EventsPage() {
  const initialEvents = await getEvents();

  return <EventsClient initialEvents={initialEvents} />;
}
