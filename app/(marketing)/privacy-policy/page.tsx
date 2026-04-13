// app/(marketing)/privacy-policy/page.tsx

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy – Nexa App",
  description:
    "Learn how Nexa App collects, uses, and protects your personal data.",
};

export default function PrivacyPolicyPage() {
  return (
    <main className="max-w-4xl mx-auto px-6 py-12 text-gray-800 leading-relaxed">

      <h1 className="text-3xl font-bold text-red-700 mb-4">
        Privacy Policy
      </h1>

      <p className="mb-6">
        <strong>Effective Date:</strong> October 29, 2025
      </p>

      <p className="mb-6">
        Nexa App (“we”, “our”, “us”), developed and operated by{" "}
        <strong>Broadshift Technologies Limited</strong>, respects your privacy.
        This Privacy Policy explains how we collect, use, and protect your information
        when you use our mobile or web applications (“Services”).
      </p>

      <h2 className="text-xl font-semibold text-red-700 mt-8 mb-3">
        1. Information We Collect
      </h2>

      <ul className="list-disc pl-6 space-y-2">
        <li>
          <strong>Contact Information:</strong> Name, phone number, and email address — used for account registration, verification, and communication.
        </li>
        <li>
          <strong>Identifiers:</strong> Device ID or installation ID — used to secure and improve your experience.
        </li>
        <li>
          <strong>Transaction Data:</strong> Payment history, transaction IDs, and purchase details — used for receipts and service records.
        </li>
        <li>
          <strong>User Content:</strong> Feedback or support messages you send us.
        </li>
        <li>
          <strong>Usage Data:</strong> App interactions, crash logs, and analytics events.
        </li>
      </ul>

      <h2 className="text-xl font-semibold text-red-700 mt-8 mb-3">
        2. How We Use Your Information
      </h2>

      <ul className="list-disc pl-6 space-y-2">
        <li>To provide and improve app functionality</li>
        <li>To process payments and verify transactions</li>
        <li>To offer customer support and respond to inquiries</li>
        <li>To send important updates (security alerts, service notifications)</li>
        <li>To personalize your experience</li>
        <li>For internal analytics and product development</li>
      </ul>

      <h2 className="text-xl font-semibold text-red-700 mt-8 mb-3">
        3. Data Sharing and Disclosure
      </h2>

      <p className="mb-3">We do not sell your data. We may share limited information with trusted third parties for:</p>

      <ul className="list-disc pl-6 space-y-2">
        <li>Payment processing (e.g., Paystack, Flutterwave)</li>
        <li>Analytics (e.g., Firebase, Google Analytics)</li>
        <li>Push notifications and crash reporting services</li>
        <li>
          Financial service providers (e.g., Paystack, Flutterwave) to securely process payments and transactions
        </li>
      </ul>

      <h2 className="text-xl font-semibold text-red-700 mt-8 mb-3">
        4. Data Retention and Security
      </h2>

      <p className="mb-6">
        Your information is protected using industry-standard security measures including HTTPS encryption,
        secure APIs, and restricted internal access.
      </p>

      <h2 className="text-xl font-semibold text-red-700 mt-8 mb-3">
        5. Financial Services Transparency
      </h2>

      <p className="mb-6">
        Nexa App facilitates payments for services such as airtime, data subscriptions, and bill payments.
        We do not operate as a bank or financial institution. All payment transactions are securely processed
        by licensed third-party payment providers.
      </p>

      <h2 className="text-xl font-semibold text-red-700 mt-8 mb-3">
        6. Your Rights
      </h2>

      <p className="mb-6">
        You may request to access, update, or delete your data by contacting us at{" "}
        <a className="text-blue-600 underline" href="mailto:privacy@nexaapp.com">
          privacy@nexaapp.com
        </a>.
      </p>

      <h2 className="text-xl font-semibold text-red-700 mt-8 mb-3">
        7. Children’s Privacy
      </h2>

      <p className="mb-6">
        Nexa App is not intended for children under 13. We do not knowingly collect personal information from minors.
      </p>

      <h2 className="text-xl font-semibold text-red-700 mt-8 mb-3">
        8. Changes to This Policy
      </h2>

      <p className="mb-6">
        We may update this Privacy Policy periodically. Updates will appear here and take effect immediately upon publication.
      </p>

      <h2 className="text-xl font-semibold text-red-700 mt-8 mb-3">
        9. Contact Us
      </h2>

      <p>
        <strong>Broadshift Technologies Limited</strong><br />
        Email:{" "}
        <a className="text-blue-600 underline" href="mailto:privacy@nexaapp.com">
          privacy@nexaapp.com
        </a>
        <br />
        Address: Lagos, Nigeria
      </p>

    </main>
  );
}
