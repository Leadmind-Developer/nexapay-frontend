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

  const previewUrl = `/organizer/events/${eventId}/preview`;

  return (
    <div className="sticky top-0 z-40 bg-white dark:bg-neutral-900 border-b dark:border-gray-700 px-6 py-3 flex items-center justify-between">
      {/* Event Status */}
      <span className="text-sm text-gray-600 dark:text-gray-300">
        Status:{" "}
        <span
          className={`font-medium ${
            published ? "text-green-600 dark:text-green-400" : "text-yellow-600 dark:text-yellow-400"
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
          className="rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors"
        >
          Preview
        </Link>

        {/* Publish/Unpublish */}
        <button
          onClick={onTogglePublish}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            published
              ? "bg-yellow-500 text-white hover:bg-yellow-600 dark:bg-yellow-400 dark:hover:bg-yellow-500"
              : "bg-green-600 text-white hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600"
          }`}
        >
          {published ? "Unpublish" : "Publish"}
        </button>
      </div>
    </div>
  );
}
