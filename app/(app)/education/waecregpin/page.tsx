"use client";
import EducationCheckout from "@/components/EducationCheckout";

export default function Page() {
  return (
    <EducationCheckout
      title="WAEC Registration PIN"
      serviceID="waec-registration"
      requiresVerification={false}
    />
  );
}
