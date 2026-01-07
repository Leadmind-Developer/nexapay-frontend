import { Suspense } from "react";
import PayCallbackClient from "./pay-callback-client";

export default function PayCallbackPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <PayCallbackClient />
    </Suspense>
  );
}

function LoadingState() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white rounded-2xl shadow-md p-8 max-w-md w-full text-center">
        <div className="w-12 h-12 border-4 border-gray-200 border-t-black rounded-full animate-spin mx-auto" />
        <h1 className="text-xl font-semibold mt-4">Processing Payment</h1>
        <p className="text-gray-500 mt-2">Preparing verification…</p>
      </div>
    </main>
  );
}
