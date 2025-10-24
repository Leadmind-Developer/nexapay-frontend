"use client";

import EnterpriseBulkForm from "@/components/transactions/EnterpriseBulkForm";
import SEO from "@/components/SEO";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Enterprise Bulk | NexaApp",
  description: "Initiate and manage enterprise bulk transactions on NexaApp.",
};

export default function EnterpriseBulkPage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <SEO title="Enterprise Bulk Transactions" />
      <h2 className="text-2xl font-bold mb-4">Enterprise Bulk Transactions</h2>
      <EnterpriseBulkForm />
    </div>
  );
}
