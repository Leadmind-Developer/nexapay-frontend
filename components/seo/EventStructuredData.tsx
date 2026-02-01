import Script from "next/script";

interface EventSEOProps {
  name: string;
  description: string;
  startDate: string;
  endDate?: string;
  location: string;
  image: string;
  url: string;
  price?: string;
}

export default function EventStructuredData({
  name,
  description,
  startDate,
  endDate,
  location,
  image,
  url,
  price,
}: EventSEOProps) {
  const data = {
    "@context": "https://schema.org",
    "@type": "Event",
    name,
    description,
    startDate,
    endDate,
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    eventStatus: "https://schema.org/EventScheduled",
    location: {
      "@type": "Place",
      name: location,
      address: location,
    },
    image: [image],
    url,
    offers: {
      "@type": "Offer",
      url,
      price: price || "0",
      priceCurrency: "NGN",
      availability: "https://schema.org/InStock",
    },
    organizer: {
      "@type": "Organization",
      name: "Nexa Events",
      url: "https://nexa.com.ng",
    },
  };

  return (
    <Script
      id="event-structured-data"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
