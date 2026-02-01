import { MetadataRoute } from "next";

const baseUrl = "https://nexa.com.ng";

async function getEvents() {
  try {
    const res = await fetch(`${process.env.API_URL}/events`, {
      cache: "no-store",
    });

    if (!res.ok) return [];

    return res.json();
  } catch {
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

  const eventPages: MetadataRoute.Sitemap = events.map((event: any) => ({
    url: `${baseUrl}/events/${event.id}`,
    lastModified: new Date(event.updatedAt || event.startAt),
    changeFrequency: "daily",
    priority: 0.8,
  }));

  return [...staticPages, ...eventPages];
}
