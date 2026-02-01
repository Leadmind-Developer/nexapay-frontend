interface EventStructuredDataProps {
  event: any;
}

export default function EventStructuredData({ event }: EventStructuredDataProps) {
  const isFree = event.ticketTypes.every((t: any) => t.price === 0);

  const location =
    event.type === "VIRTUAL"
      ? {
          "@type": "VirtualLocation",
          url: "https://nexa.com/events/" + event.id,
        }
      : {
          "@type": "Place",
          name: event.address || "Event venue",
          address: {
            "@type": "PostalAddress",
            addressLocality: event.city,
            addressCountry: event.country,
          },
        };

  const schema = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.title,
    description: event.description,
    startDate: event.startAt,
    endDate: event.endAt,
    eventAttendanceMode:
      event.type === "VIRTUAL"
        ? "https://schema.org/OnlineEventAttendanceMode"
        : "https://schema.org/OfflineEventAttendanceMode",
    location,
    organizer: {
      "@type": "Organization",
      name: event.organizer?.name,
    },
    image: event.images?.map((i: any) => i.url),
    offers: {
      "@type": "Offer",
      price: isFree ? "0" : event.ticketTypes[0]?.price,
      priceCurrency: "NGN",
      availability: "https://schema.org/InStock",
      url: `https://nexa.com.ng/events/${event.id}`,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schema),
      }}
    />
  );
}
