export function getEventImage(event: any): string | null {
  if (!event) return null;

  // Preferred (current backend)
  if (Array.isArray(event.images) && event.images.length > 0) {
    return event.images[0]?.url ?? null;
  }

  // Backward / optional support
  if (typeof event.imageUrl === "string") {
    return event.imageUrl;
  }

  return null;
}
