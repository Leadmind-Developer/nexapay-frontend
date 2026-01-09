"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function RecoverySuccessPage() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    const t = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          router.push("/dashboard");
          return 0;
        }
        return c - 1;
      });
    }, 1000);

    return () => clearInterval(t);
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 w-full max-w-md text-center space-y-4">
        <h1 className="text-2xl font-semibold text-green-600">
          Verification Successful
        </h1>

        <p className="text-gray-600 dark:text-gray-300">
          You’ve been securely verified and logged in.
        </p>

        <button
          onClick={() => router.push("/dashboard")}
          className="w-full py-3 rounded-lg bg-blue-600 text-white font-medium"
        >
          Continue to Dashboard
        </button>

        <p className="text-sm text-gray-500">
          Redirecting automatically in {countdown}s…
        </p>
      </div>
    </div>
  );
}
