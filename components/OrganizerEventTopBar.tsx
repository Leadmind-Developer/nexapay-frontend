"use client";

import Link from "next/link";

interface Props {
  eventId?: string;
  published: boolean;
  onTogglePublish: () => void;
}

/**
 * OrganizerEventTopBar
 *
 * Shows event status, allows publish/unpublish,
 * and provides a safe draft preview link for organizers.
 */
export default function OrganizerEventTopBar({
  eventId,
  published,
  onTogglePublish,
}: Props) {
  if (!eventId) return null;

  // Draft preview link — only accessible by organizer
  const previewUrl = `/organizer/events/${eventId}/preview`;

  return (
    <div className="sticky top-0 z-40 bg-white border-b px-6 py-3 flex items-center justify-between">
      {/* Event Status */}
      <span className="text-sm text-gray-600">
        Status:{" "}
        <span
          className={`font-medium ${
            published ? "text-green-600" : "text-yellow-600"
          }`}
        >
          {published ? "Published" : "Draft"}
        </span>
      </span>

      {/* Actions */}
      <div className="flex gap-3">
        {/* Draft-safe Preview */}
        <Link
          href={previewUrl}
          target="_blank"
          className="rounded-lg border px-4 py-2 text-sm hover:bg-gray-50"
        >
          Preview
        </Link>

        {/* Publish/Unpublish */}
        <button
          onClick={onTogglePublish}
          className={`rounded-lg px-4 py-2 text-sm font-medium ${
            published
              ? "bg-yellow-500 text-white hover:bg-yellow-600"
              : "bg-green-600 text-white hover:bg-green-700"
          }`}
        >
          {published ? "Unpublish" : "Publish"}
        </button>
      </div>
    </div>
  );
}
