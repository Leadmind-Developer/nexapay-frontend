"use client";
import EducationCheckout from "@/components/EducationCheckout";

export default function Page() {
  return (
    <EducationCheckout
      title="JAMB PIN (UTME / Direct Entry)"
      serviceID="jamb"
      requiresVerification={true}
      verifyEndpoint="/vtpass/education/jamb/verify"
    />
  );
}
