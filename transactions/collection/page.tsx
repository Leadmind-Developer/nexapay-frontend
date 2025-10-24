"use client";

import CollectionForm from "@/components/transactions/CollectionForm";
import SEO from "@/components/SEO";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Collection | NexaApp",
  description: "Initiate collection transactions via USSD push or Paycode.",
};

export default function CollectionPage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <SEO title="Initiate Collection" />
      <h2 className="text-2xl font-bold mb-4">Collection Transactions</h2>
      <CollectionForm /> {/* client component */}
    </div>
  );
}
