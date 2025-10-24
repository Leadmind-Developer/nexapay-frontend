"use client";
import TransactionForm from "../../components/TransactionForm";

export default function SmartCashPage() {
  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <h1 className="text-3xl font-bold mb-6 text-center">SmartCash Transactions</h1>
      <TransactionForm provider="SmartCash" />
    </div>
  );
}
