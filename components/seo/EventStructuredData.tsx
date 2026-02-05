// components/seo/EventStructuredData.tsx
interface EventStructuredDataProps {
  slug: string; // new prop instead of full event
}

export default function EventStructuredData({ slug }: EventStructuredDataProps) {
  // Generate a readable title from slug
  const title = slug.replace(/-/g, " ");

  // Minimal structured data for SEO
  const schema = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: title,
    description: `Join ${title} on Nexa Events. Discover details, tickets, and more.`,
    startDate: new Date().toISOString(), // placeholder
    endDate: new Date(new Date().getTime() + 60 * 60 * 1000).toISOString(), // +1 hour
    eventAttendanceMode: "https://schema.org/OnlineEventAttendanceMode", // default to virtual
    location: {
      "@type": "VirtualLocation",
      url: `https://www.nexa.com.ng/events/${slug}`,
    },
    organizer: {
      "@type": "Organization",
      name: "Nexa Events",
    },
    image: [`https://www.nexa.com.ng/images/events/${slug}.jpg`], // optional placeholder
    offers: {
      "@type": "Offer",
      price: "0", // default free for SEO
      priceCurrency: "NGN",
      availability: "https://schema.org/InStock",
      url: `https://www.nexa.com.ng/events/${slug}`,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
