"use client";

import { useRouter } from "next/navigation";
import { AlertTriangle } from "lucide-react";
import BannersWrapper from "@/components/BannersWrapper";

interface Props {
  title?: string;
  message?: string;
  showBackButton?: boolean;
}

export default function NotAvailable({
  title = "Service Not Available",
  message = "This service is temporarily unavailable. Please check back later.",
  showBackButton = true,
}: Props) {
  const router = useRouter();

  return (
    <BannersWrapper page="insurance">
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-900 border dark:border-gray-800 rounded-xl p-8 text-center shadow-sm space-y-4">
          <div className="flex justify-center">
            <div className="bg-yellow-100 dark:bg-yellow-900/30 p-4 rounded-full">
              <AlertTriangle className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>

          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            {title}
          </h1>

          <p className="text-sm text-gray-600 dark:text-gray-400">
            {message}
          </p>

          {showBackButton && (
            <button
              onClick={() => router.back()}
              className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition"
            >
              Go Back
            </button>
          )}
        </div>
      </div>
    </BannersWrapper>
  );
}
