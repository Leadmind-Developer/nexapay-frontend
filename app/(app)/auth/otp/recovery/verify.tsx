import { Suspense } from "react";
import OTPRecoveryVerifyClient from "./verify-client";

export default function OTPRecoveryVerifyPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
          <p className="text-gray-600 dark:text-gray-300">
            Preparing verification…
          </p>
        </div>
      }
    >
      <OTPRecoveryVerifyClient />
    </Suspense>
  );
}
