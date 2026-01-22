"use client";

import Link from "next/link";

interface Props {
  eventId?: string;
  published: boolean;
  onTogglePublish: () => void;
}

export default function OrganizerEventTopBar({
  eventId,
  published,
  onTogglePublish,
}: Props) {
  return (
    <div className="sticky top-0 z-40 bg-white dark:bg-black border-b px-6 py-3 flex items-center justify-between">
      <span className="text-sm text-gray-600 dark:text-black">
        Status:{" "}
        <span
          className={`font-medium ${
            published ? "text-green-600" : "text-yellow-600"
          }`}
        >
          {published ? "Published" : "Draft"}
        </span>
      </span>

      <div className="flex gap-3">
        {eventId && (
          <Link
            href={`/events/${eventId}`}
            target="_blank"
            className="rounded-lg border px-4 py-2 text-sm hover:bg-gray-50"
          >
            Preview
          </Link>
        )}

        <button
          onClick={onTogglePublish}
          className={`text-xs px-2 py-1 rounded-full font-medium ${
            published
              ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300"
              : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300"
          }`}
        >
          {published ? "Unpublish" : "Publish"}
        </button>
      </div>
    </div>
  );
}
