"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function PayCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const reference = searchParams.get("reference") || searchParams.get("trxref");
    if (!reference) {
      router.replace("/events");
      return;
    }

    // Redirect immediately to event checkout page
    router.replace(`/events/checkout?reference=${reference}`);
  }, [router, searchParams]);

  return null; // nothing to render
}
