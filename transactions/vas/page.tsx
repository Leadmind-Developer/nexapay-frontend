import VASForm from "@/components/transactions/VASForm";
import SEO from "@/components/SEO";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "VAS / Virtual Account | NexaApp",
  description: "Create static or dynamic virtual accounts (VAS) with NexaApp.",
};

export default function VASPage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <SEO title="VAS / Virtual Account" />
      <h2 className="text-2xl font-bold mb-4">VAS / Virtual Account</h2>
      <VASForm />
    </div>
  );
}
