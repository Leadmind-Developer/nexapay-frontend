
import type { Metadata } from "next";
import Link from "next/link";
import ResponsiveLandingWrapper from "@/components/ResponsiveLandingWrapper";

export const metadata: Metadata = {
  title: "Frequently Asked Questions | Nexa",
  description:
    "Find answers to common questions about Nexa, including payments, wallet funding, utility services, discovering events, buying tickets and organizing events.",
  alternates: {
    canonical: "https://nexa.com.ng/faq",
  },
};

const faqs = [
  {
    category: "About Nexa",
    questions: [
      {
        q: "What is Nexa?",
        a: "Nexa is a digital platform that brings together convenient payment and utility services with event discovery and ticketing. You can manage supported transactions, explore upcoming events and find experiences to attend.",
      },
      {
        q: "What services does Nexa offer?",
        a: "Nexa provides services such as airtime and data purchases, TV subscriptions, electricity payments and fund transfers. You can also discover events, explore event details and purchase tickets for available events.",
      },
    ],
  },
  {
    category: "Payments and Wallet",
    questions: [
      {
        q: "How do I fund my wallet?",
        a: "You can fund your wallet using the available funding options displayed in your Nexa account, including supported card and bank transfer methods.",
      },
      {
        q: "Is Nexa secure?",
        a: "Nexa is designed with security in mind. We use security measures to help protect user information and transactions. Always keep your login details and verification codes private.",
      },
      {
        q: "What should I do if a transaction fails?",
        a: "If a transaction fails but your account or bank has been debited, contact Nexa Support with the transaction details so the issue can be investigated.",
      },
      {
        q: "Can I earn rewards on Nexa?",
        a: "Nexa offers cashback and referral rewards for eligible users and partners. Available rewards and applicable conditions may vary.",
      },
    ],
  },
  {
    category: "Events and Tickets",
    questions: [
      {
        q: "How can I discover events on Nexa?",
        a: "Visit the Events section to explore published upcoming events. You can browse event information and use the available search and filters to find experiences that interest you.",
      },
      {
        q: "What types of events can I find on Nexa?",
        a: "Depending on what organizers publish, you may find concerts, workshops, conferences, business events, parties, community gatherings and other experiences. Events may be physical or virtual.",
      },
      {
        q: "How do I buy tickets for an event?",
        a: "Open the event you are interested in, review its details and available ticket types, then follow the checkout instructions to purchase your ticket. Ticket prices and availability are displayed on the event page.",
      },
      {
        q: "Can I view event details before buying a ticket?",
        a: "Yes. Each event listing provides information supplied by its organizer, which may include the event description, date, location or online format, organizer information and available ticket options.",
      },
      {
        q: "Why can't I find an event on Nexa?",
        a: "Only events that are published and available for public discovery appear in the upcoming events directory. An event may not appear if it has not been published, has ended or is otherwise unavailable.",
      },
      {
        q: "Does Nexa support virtual events?",
        a: "Yes. Organizers can list physical and virtual events. Check the event details for information about its format and how to participate.",
      },
    ],
  },
  {
    category: "Event Organizers",
    questions: [
      {
        q: "Can I organize and promote an event on Nexa?",
        a: "Yes. Nexa provides an event platform where organizers can create and manage event listings and make available ticket options for attendees.",
      },
      {
        q: "How do I create an event on Nexa?",
        a: "Visit the event organizer section and follow the available steps to create your event. You can provide the event information and configure the available ticket options.",
      },
      {
        q: "Can I create both physical and virtual events?",
        a: "Yes. Nexa supports physical and virtual event listings, allowing organizers to publish different types of experiences.",
      },
    ],
  },
  {
    category: "Support",
    questions: [
      {
        q: "How do I contact Nexa Support?",
        a: "If you need assistance with a transaction, ticket purchase, event listing or your account, visit the Support page for the available contact options.",
      },
      {
        q: "What information should I provide when contacting support?",
        a: "Provide a clear description of the issue and any relevant reference information, such as a transaction reference or event name. Never share your password, PIN or one-time verification code.",
      },
    ],
  },
];

export default function FAQPage() {
  return (
    <ResponsiveLandingWrapper>
      <main className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <header className="mx-auto mb-10 max-w-3xl text-center">
          <h1 className="text-3xl font-bold tracking-tight text-blue-700 dark:text-blue-500 sm:text-4xl">
            Frequently Asked Questions
          </h1>

          <p className="mt-4 text-base leading-7 text-gray-600 dark:text-gray-300">
            Find answers about using Nexa for digital payments, utility
            services, discovering events, purchasing tickets and organizing
            experiences.
          </p>
        </header>

        <div className="space-y-10">
          {faqs.map((section) => (
            <section key={section.category}>
              <h2 className="mb-4 border-b border-gray-200 pb-3 text-xl font-bold text-gray-900 dark:border-gray-700 dark:text-white">
                {section.category}
              </h2>

              <div className="space-y-4">
                {section.questions.map((item) => (
                  <article
                    key={item.q}
                    className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
                  >
                    <h3 className="mb-2 font-semibold text-gray-800 dark:text-gray-100">
                      {item.q}
                    </h3>

                    <p className="text-sm leading-7 text-gray-600 dark:text-gray-300">
                      {item.a}
                    </p>
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>

        <section className="mt-12 rounded-2xl bg-blue-50 p-6 text-center dark:bg-gray-800 sm:p-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Ready to explore Nexa?
          </h2>

          <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-gray-600 dark:text-gray-300">
            Discover upcoming events, find your next experience or get started
            with organizing an event on Nexa.
          </p>

          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              href="/events"
              className="rounded-lg bg-blue-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-800"
            >
              Explore Events
            </Link>

            <Link
              href="/organizer/events"
              className="rounded-lg border border-blue-700 px-5 py-3 text-sm font-semibold text-blue-700 transition hover:bg-blue-100 dark:border-blue-400 dark:text-blue-400 dark:hover:bg-gray-700"
            >
              Organize an Event
            </Link>

            <Link
              href="/support"
              className="rounded-lg border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-100 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
            >
              Contact Support
            </Link>
          </div>
        </section>
      </main>
    </ResponsiveLandingWrapper>
  );
}
