
import type { MetadataRoute } from "next";

const baseUrl = "https://nexa.com.ng";

const apiBaseUrl = (
  process.env.NEXT_PUBLIC_API_BASE ||
  "https://api.nexa.com.ng/api"
).replace(/\/+$/, "");

interface PublicEvent {
  id: string;
  slug: string;
  published?: boolean;
  updatedAt?: string;
  startAt?: string;
}

async function getEvents(): Promise<PublicEvent[]> {
  try {
    const res = await fetch(`${apiBaseUrl}/events`, {
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      throw new Error(
        `Events API returned status ${res.status}`
      );
    }

    const data: unknown = await res.json();

    if (!Array.isArray(data)) {
      throw new Error("Events API returned an unexpected response format");
    }

    return data.filter(
      (event): event is PublicEvent =>
        typeof event?.slug === "string" &&
        event.slug.length > 0 &&
        event.published !== false
    );
  } catch (error) {
    console.error("Sitemap: Failed to fetch public events:", error);
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const events = await getEvents();

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/landing`,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/about`,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/contact`,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/faq`,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/support`,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/events`,
      changeFrequency: "daily",
      priority: 0.85,
    },
    {
      url: `${baseUrl}/privacy-policy`,
      changeFrequency: "yearly",
      priority: 0.4,
    },
    {
      url: `${baseUrl}/terms`,
      changeFrequency: "yearly",
      priority: 0.4,
    },
  ];

  const eventPages: MetadataRoute.Sitemap = events.map((event) => {
    const lastModifiedValue = event.updatedAt || event.startAt;
    const lastModified = lastModifiedValue
      ? new Date(lastModifiedValue)
      : undefined;

    return {
      url: `${baseUrl}/events/${encodeURIComponent(event.slug)}`,
      ...(lastModified &&
      !Number.isNaN(lastModified.getTime())
        ? { lastModified }
        : {}),
      changeFrequency: "daily",
      priority: 0.8,
    };
  });

  return [...staticPages, ...eventPages];
}
