export const metadata = {
  title: "Financial Disclosure – Nexa App",
  description:
    "Learn how financial transactions are handled on Nexa App, including payments, fees, and wallet usage.",
};

export default function FinancialDisclosurePage() {
  return (
    <main className="max-w-4xl mx-auto px-6 py-12 text-gray-800 leading-relaxed">
      
      <h1 className="text-3xl font-bold text-red-700 mb-4">
        Financial Disclosure
      </h1>

      <p className="mb-6">
        <strong>Effective Date:</strong> October 29, 2025
      </p>

      <p className="mb-6">
        Nexa App is operated by <strong>Techtrep</strong>. This page explains how financial transactions are handled within the app.
      </p>

      <h2 className="text-2xl font-semibold text-red-700 mt-8 mb-3">
        1. Nature of Services
      </h2>
      <p className="mb-6">
        Nexa App provides a platform that enables users to purchase digital services such as airtime, data subscriptions, bill payments, and event-related services.
      </p>

      <h2 className="text-2xl font-semibold text-red-700 mt-8 mb-3">
        2. No Banking Services
      </h2>
      <p className="mb-6">
        Nexa App is not a bank or licensed financial institution. We do not offer loans, credit facilities, or investment services.
      </p>

      <h2 className="text-2xl font-semibold text-red-700 mt-8 mb-3">
        3. Payment Processing
      </h2>
      <p className="mb-6">
        All payments made through Nexa App are securely processed by licensed third-party payment providers such as Paystack, Flutterwave, or other authorized processors.
      </p>

      <h2 className="text-2xl font-semibold text-red-700 mt-8 mb-3">
        4. Wallet Functionality
      </h2>
      <p className="mb-6">
        If wallet functionality is provided, it is for the purpose of facilitating faster transactions within the app. Funds stored in the wallet are not bank deposits and do not earn interest.
      </p>

      <h2 className="text-2xl font-semibold text-red-700 mt-8 mb-3">
        5. Fees and Charges
      </h2>
      <p className="mb-6">
        Nexa App may apply service fees where applicable. Any applicable fees will be clearly displayed before a transaction is completed.
      </p>

      <h2 className="text-2xl font-semibold text-red-700 mt-8 mb-3">
        6. Transaction Finality
      </h2>
      <p className="mb-6">
        Most transactions are processed instantly and may not be reversible once completed. However, in cases of failed or incorrect transactions, users may contact support for assistance.
      </p>

      <h2 className="text-2xl font-semibold text-red-700 mt-8 mb-3">
        7. Compliance and Security
      </h2>
      <p className="mb-6">
        We take reasonable steps to ensure that all transactions are secure. This includes the use of encryption, secure APIs, and trusted payment infrastructure.
      </p>

      <h2 className="text-2xl font-semibold text-red-700 mt-8 mb-3">
        8. Contact Information
      </h2>

      <p className="mb-2">For financial or transaction-related inquiries, please contact:</p>

      <div className="border p-4 rounded-lg bg-gray-50">
        <p><strong>Techtrep</strong></p>
        <p>Email: support@nexaapp.com</p>
        <p>Lagos, Nigeria</p>
      </div>

    </main>
  );
}
