// app/(events)/events/[id]/page.tsx
import EventClient from "./EventClient";
import EventStructuredData from "@/components/seo/EventStructuredData";

// You can use `params.id` as slug
export async function generateMetadata({ params }: { params: { id: string } }) {
  // Minimal SEO metadata, without fetching
  return {
    title: `${params.id.replace(/-/g, " ")} | Nexa Events`,
    description: "Discover amazing events on Nexa Events",
    openGraph: {
      title: `${params.id.replace(/-/g, " ")} | Nexa Events`,
      description: "Discover amazing events on Nexa Events",
      type: "event",
      // image: optional, static fallback
    },
  };
}

export default function EventPage({ params }: { params: { id: string } }) {
  // No server fetch needed
  return (
    <>
      {/* SEO structured data - minimal for now */}
      <EventStructuredData
        event={{
          id: params.id,
          title: params.id.replace(/-/g, " "),
          description: "Discover amazing events on Nexa Events",
          startAt: new Date().toISOString(),
          endAt: new Date().toISOString(),
          type: "VIRTUAL",
          organizer: { name: "Nexa Events" },
          ticketTypes: [{ price: 0 }],
          images: [],
        }}
      />

      {/* Client-side fetching and full UI */}
      <EventClient />
    </>
  );
}
