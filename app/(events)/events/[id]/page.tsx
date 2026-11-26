
import type { Metadata } from "next";
import { cache } from "react";
import { notFound } from "next/navigation";
import api from "@/lib/api";
import EventClient from "./EventClient";

export const revalidate = 300;

interface EventImage {
  url: string;
  isPrimary?: boolean;
}

interface TicketType {
  id: string;
  name: string;
  price: number;
  currency?: string;
  quantity: number;
  sold: number;
}

interface Event {
  id: string;
  title: string;
  slug: string;
  description?: string | null;
  startAt: string;
  endAt: string;
  type: "PHYSICAL" | "VIRTUAL";
  address?: string | null;
  venue?: string | null;
  city?: string | null;
  country?: string | null;
  category?: string | null;
  organizer?: { name: string } | null;
  ticketTypes: TicketType[];
  images?: EventImage[];
}

type PageProps = {
  params: Promise<{ id: string }>;
};

/* ===================== EVENT FETCHING ===================== */

// Shared between generateMetadata() and the page render.
const getEvent = cache(async (idOrSlug: string): Promise<Event | null> => {
  try {
    const res = await api.get<Event>(
      `/events/${encodeURIComponent(idOrSlug)}`,
      { timeout: 15000 }
    );

    return res.data ?? null;
  } catch (error) {
    const status = (
      error as { response?: { status?: number } }
    )?.response?.status;

    if (status === 404) {
      return null;
    }

    console.error(`Failed to fetch event "${idOrSlug}":`, error);
    throw error;
  }
});

/* ===================== HELPERS ===================== */

function getEventDescription(event: Event): string {
  const description = (event.description ?? "")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return (
    description.slice(0, 155) ||
    `Discover ${event.title} on Nexa. Find event details, explore ticket options and secure your tickets.`
  );
}

function getEventImage(event: Event): string | undefined {
  return (
    event.images?.find((image) => image.isPrimary)?.url ||
    event.images?.[0]?.url
  );
}

function getEventLocation(event: Event): string {
  return [
    event.venue,
    event.address,
    event.city,
    event.country,
  ]
    .filter(Boolean)
    .join(", ");
}

/* ===================== SEO METADATA ===================== */

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const event = await getEvent(id);

  if (!event) {
    return {
      title: "Event Not Found | Nexa",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const canonicalUrl = `https://nexa.com.ng/events/${encodeURIComponent(
    event.slug
  )}`;

  const description = getEventDescription(event);
  const image = getEventImage(event);

  return {
    title: `${event.title} | Nexa Events`,
    description,

    alternates: {
      canonical: canonicalUrl,
    },

    openGraph: {
      type: "website",
      url: canonicalUrl,
      siteName: "Nexa",
      title: `${event.title} | Nexa Events`,
      description,
      ...(image
        ? {
            images: [
              {
                url: image,
                alt: event.title,
              },
            ],
          }
        : {}),
    },

    twitter: {
      card: image ? "summary_large_image" : "summary",
      title: `${event.title} | Nexa Events`,
      description,
      ...(image ? { images: [image] } : {}),
    },
  };
}

/* ===================== JSON-LD ===================== */

function buildEventJsonLd(event: Event) {
  const canonicalUrl = `https://nexa.com.ng/events/${encodeURIComponent(
    event.slug
  )}`;

  const location =
    event.type === "VIRTUAL"
      ? {
          "@type": "VirtualLocation",
          url: canonicalUrl,
        }
      : {
          "@type": "Place",
          name: event.venue || event.title,
          address: {
            "@type": "PostalAddress",
            streetAddress: event.address || undefined,
            addressLocality: event.city || undefined,
            addressCountry: event.country || undefined,
          },
        };

  const offers = (event.ticketTypes ?? []).map((ticket) => ({
    "@type": "Offer",
    name: ticket.name,
    price: ticket.price,
    priceCurrency: ticket.currency || "NGN",
    availability:
      ticket.sold >= ticket.quantity
        ? "https://schema.org/SoldOut"
        : "https://schema.org/InStock",
    url: `${canonicalUrl}`,
  }));

  return {
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.title,
    description: getEventDescription(event),
    url: canonicalUrl,
    startDate: new Date(event.startAt).toISOString(),
    endDate: new Date(event.endAt).toISOString(),
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode:
      event.type === "VIRTUAL"
        ? "https://schema.org/OnlineEventAttendanceMode"
        : "https://schema.org/OfflineEventAttendanceMode",
    location,
    ...(getEventImage(event)
      ? { image: [getEventImage(event)] }
      : {}),
    ...(event.organizer?.name
      ? {
          organizer: {
            "@type": "Organization",
            name: event.organizer.name,
          },
        }
      : {}),
    ...(offers.length > 0 ? { offers } : {}),
  };
}

/* ===================== PAGE ===================== */

export default async function EventPage({ params }: PageProps) {
  const { id } = await params;
  const event = await getEvent(id);

  if (!event || !event.slug) {
    notFound();
  }

  // Related events should not prevent the main event page from loading.
  let relatedEvents: Event[] = [];

  if (event.category) {
    try {
      const res = await api.get<Event[]>("/events", {
        params: {
          category: event.category,
          limit: 7,
        },
        timeout: 10000,
      });

      if (Array.isArray(res.data)) {
        relatedEvents = res.data
          .filter(
            (related) =>
              related.id !== event.id &&
              Boolean(related.slug)
          )
          .slice(0, 6);
      }
    } catch (error) {
      console.error("Failed to load related events:", error);
    }
  }

  const jsonLd = buildEventJsonLd(event);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />

      <EventClient
        event={event}
        relatedEvents={relatedEvents}
      />
    </>
  );
}
