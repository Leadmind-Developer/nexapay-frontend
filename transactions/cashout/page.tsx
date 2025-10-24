import CashOutForm from "@/components/transactions/CashOutForm";
import SEO from "@/components/SEO";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cash Out | NexaApp",
  description: "Perform cash out transactions securely via bank or wallet.",
};

export default function CashOutPage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <SEO title="Cash Out Transactions" />
      <h2 className="text-2xl font-bold mb-4">Cash Out Transactions</h2>
      <CashOutForm /> {/* client component */}
    </div>
  );
}
