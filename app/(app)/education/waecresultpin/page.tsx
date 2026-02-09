"use client";
import EducationCheckout from "@/components/EducationCheckout";

export default function Page() {
  return (
    <EducationCheckout
      title="WAEC Result Checker PIN"
      serviceID="waec"
      requiresVerification={false}
    />
  );
}
