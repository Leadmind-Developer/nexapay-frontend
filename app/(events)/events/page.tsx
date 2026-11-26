
import type { Metadata } from "next";
import EventsClient from "./EventsClient";
import api from "@/lib/api";

export const metadata: Metadata = {
  title: "Discover Events Near You | Nexa",
  description:
    "Discover upcoming concerts, workshops, conferences, parties and other events on Nexa. Explore events, find experiences and get your tickets.",
  alternates: {
    canonical: "https://nexa.com.ng/events",
  },
};

export const revalidate = 300; // Refresh the directory every 5 minutes.

async function getEvents(): Promise<{
  events: any[];
  unavailable: boolean;
}> {
  try {
    const res = await api.get("/events", {
      params: { limit: 50 },
      timeout: 15000,
    });

    // The public API is expected to return a Prisma array.
    if (!Array.isArray(res.data)) {
      console.error(
        "Events API returned an unexpected response format:",
        res.data
      );

      return {
        events: [],
        unavailable: true,
      };
    }

    return {
      events: res.data,
      unavailable: false,
    };
  } catch (err) {
    console.error("Failed to fetch public events:", err);

    return {
      events: [],
      unavailable: true,
    };
  }
}


export default async function EventsPage() {
  const { events, unavailable } = await getEvents();

  return (
    <>
      <section className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Discover Events Near You
          </h1>

          <p className="mt-4 text-base leading-7 text-gray-600">
            Discover upcoming concerts, workshops, conferences, parties and
            other experiences. Explore events, find something new and get your
            tickets with Nexa.
          </p>
        </div>
      </section>

      <EventsClient
        initialEvents={events}
        eventsUnavailable={unavailable}
      />
    </>
  );
}

