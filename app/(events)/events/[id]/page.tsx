import EventClient from "./EventClient";
import EventStructuredData from "@/components/seo/EventStructuredData";

export async function generateMetadata({ params }: { params: { id: string } }) {
  const title = params.id.replace(/-/g, " ");
  return {
    title: `${title} | Nexa Events`,
    description: `Join ${title} on Nexa Events. Discover details, tickets, and more.`,
    openGraph: {
      title,
      description: `Join ${title} on Nexa Events. Discover details, tickets, and more.`,
      type: "event",
      images: [`https://www.nexa.com.ng/images/events/${params.id}.jpg`],
    },
  };
}

export default function EventPage({ params }: { params: { id: string } }) {
  return (
    <>
      {/* ✅ SEO structured data */}
      <EventStructuredData slug={params.id} />

      {/* ✅ Client-side fetching for live data */}
      <EventClient clientSlug={params.id} />
    </>
  );
}
