// Remove "use client"
import React from "react";
import Link from "next/link";

export const metadata = {
  title: "Event Image Guidelines | Nexa Events",
  description:
    "Learn the recommended image size, aspect ratio, and formats for your event images to ensure your event cards display perfectly.",
};

export default function EventImageGuidelinesPage() {
  const recommendedSizes = [
    { label: "Standard Display", size: "1200 × 675 px (16:9)" },
    { label: "High Quality", size: "1600 × 900 px (16:9)" },
    { label: "Full HD", size: "1920 × 1080 px (16:9)" },
  ];

  const tips = [
    "Use landscape images (16:9) for best display in event cards.",
    "Keep important text and logos in the center to avoid cropping.",
    "JPEG or PNG formats work best.",
    "Avoid very small images (<800 px width) as they may appear blurry.",
    "Try to maintain consistent style for all event images.",
  ];

  return (
    <main className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-6">
        <h1 className="text-4xl font-bold mb-6 text-center">
          Event Image Guidelines
        </h1>

        <p className="text-gray-700 mb-8 text-center">
          To ensure your event images look great in listings and featured cards,
          follow these recommendations.
        </p>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Recommended Sizes</h2>
          <ul className="list-disc pl-5 space-y-2 text-gray-700">
            {recommendedSizes.map((item) => (
              <li key={item.size}>
                <strong>{item.label}:</strong> {item.size}
              </li>
            ))}
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Tips for Best Results</h2>
          <ul className="list-disc pl-5 space-y-2 text-gray-700">
            {tips.map((tip, idx) => (
              <li key={idx}>{tip}</li>
            ))}
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Example</h2>
          <div className="border border-gray-300 rounded-lg overflow-hidden max-w-md mx-auto">
            <img
              src="/images/example-event-image.jpg"
              alt="Example Event Image"
              className="w-full"
            />
          </div>
          <p className="text-gray-500 text-sm mt-2 text-center">
            This image uses 1200×675 px (16:9) and all text is visible.
          </p>
        </section>

        <div className="text-center mt-10">
          <Link
            href="/organizer/events/create"
            className="inline-block bg-black text-white px-6 py-3 rounded-xl font-medium"
          >
            Back to Create Event
          </Link>
        </div>
      </div>
    </main>
  );
}
