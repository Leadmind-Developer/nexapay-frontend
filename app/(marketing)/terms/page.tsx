export const metadata = {
  title: "Terms of Service – Nexa App",
  description: "Read the Terms of Service for using Nexa App and its services.",
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-white text-gray-800 px-6 py-12 md:px-20">
      <div className="max-w-4xl mx-auto">

        {/* HEADER */}
        <h1 className="text-3xl md:text-4xl font-bold text-red-600 mb-4">
          Terms of Service
        </h1>

        <p className="mb-8">
          <strong>Effective Date:</strong> October 29, 2025
        </p>

        {/* SECTION 1 */}
        <h2 className="text-xl font-semibold text-red-600 mt-8 mb-2">
          1. Acceptance of Terms
        </h2>
        <p className="mb-4">
          By using the Nexa App, you agree to these Terms of Service. If you do not agree, please discontinue use immediately.
        </p>

        {/* SECTION 2 */}
        <h2 className="text-xl font-semibold text-red-600 mt-8 mb-2">
          2. Service Overview
        </h2>
        <p className="mb-4">
          Nexa App provides digital payment services, including airtime and data purchases, bill payments, and fund transfers.
        </p>

        {/* SECTION 3 */}
        <h2 className="text-xl font-semibold text-red-600 mt-8 mb-2">
          3. Account Registration
        </h2>
        <p className="mb-4">
          You must provide accurate and current information when creating an account. You are responsible for maintaining the confidentiality of your PIN and Face ID access.
        </p>

        {/* SECTION 4 */}
        <h2 className="text-xl font-semibold text-red-600 mt-8 mb-2">
          4. Prohibited Uses
        </h2>
        <ul className="list-disc pl-6 mb-4 space-y-1">
          <li>Using the app for fraudulent or unlawful purposes</li>
          <li>Attempting to disrupt or reverse engineer the app</li>
          <li>Impersonating others or submitting false information</li>
        </ul>

        {/* SECTION 5 */}
        <h2 className="text-xl font-semibold text-red-600 mt-8 mb-2">
          5. Transactions and Payments
        </h2>
        <p className="mb-4">
          Nexa App enables users to make payments for digital services such as airtime, data subscriptions, and bill payments. Payments are processed securely through third-party payment providers.
        </p>
        <p className="mb-4">
          While most transactions are processed instantly and are generally non-reversible, users may contact support in cases of failed or disputed transactions. Resolution will be handled in accordance with our internal policies and third-party provider guidelines.
        </p>

        {/* SECTION 6 */}
        <h2 className="text-xl font-semibold text-red-600 mt-8 mb-2">
          6. Intellectual Property
        </h2>
        <p className="mb-4">
          All content, logos, and software components of Nexa App are owned by Broadshift Technologies Limited and protected under copyright law.
        </p>

        {/* SECTION 7 */}
        <h2 className="text-xl font-semibold text-red-600 mt-8 mb-2">
          7. Limitation of Liability
        </h2>
        <p className="mb-4">
          We are not liable for any indirect, incidental, or consequential damages arising from your use of the app.
        </p>

        {/* SECTION 8 */}
        <h2 className="text-xl font-semibold text-red-600 mt-8 mb-2">
          8. Termination
        </h2>
        <p className="mb-4">
          We may suspend or terminate your account for violation of these Terms or misuse of the platform.
        </p>

        {/* SECTION 9 */}
        <h2 className="text-xl font-semibold text-red-600 mt-8 mb-2">
          9. Changes to Terms
        </h2>
        <p className="mb-4">
          We reserve the right to update these Terms at any time. The latest version will always be available on our website.
        </p>

        {/* SECTION 10 */}
        <h2 className="text-xl font-semibold text-red-600 mt-8 mb-2">
          10. Contact Us
        </h2>
        <p className="mb-4">
          <strong>Broadshift Technologies Limited</strong><br />
          Email:{" "}
          <a
            href="mailto:support@nexaapp.com"
            className="text-red-600 underline"
          >
            support@nexaapp.com
          </a>
          <br />
          Address: Lagos, Nigeria
        </p>

      </div>
    </main>
  );
}
