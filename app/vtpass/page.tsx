"use client";
import TransactionForm from "../../components/TransactionForm";

export default function VTPassPage() {
  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <h1 className="text-3xl font-bold mb-6 text-center">VTpass Transactions</h1>
      <TransactionForm provider="VTpass" />
    </div>
  );
}
