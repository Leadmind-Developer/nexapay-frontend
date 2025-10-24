import RemittanceForm from "@/components/transactions/RemittanceForm";
import SEO from "@/components/SEO";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Remittance | NexaApp",
  description: "Send remittance transactions with raw JSON payloads securely.",
};

export default function RemittancePage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <SEO title="Remittance Transactions" />
      <h2 className="text-2xl font-bold mb-4">Remittance Transactions</h2>
      <RemittanceForm /> {/* client component */}
    </div>
  );
}
