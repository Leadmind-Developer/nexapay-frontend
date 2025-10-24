import DisbursementForm from "@/components/transactions/DisbursementForm";
import SEO from "@/components/SEO";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Disbursement | NexaApp",
  description: "Perform disbursement transactions securely via wallet or bank account.",
};

export default function DisbursementPage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <SEO title="Disbursement Transactions" />
      <h2 className="text-2xl font-bold mb-4">Disbursement Transactions</h2>
      <DisbursementForm /> {/* client component */}
    </div>
  );
}
