// ./app/otp/page.tsx
import OTPClient from "./OTPClient";

// Make page dynamic to prevent prerender errors
export const dynamic = "force-dynamic";

export default function OTPPage() {
  return <OTPClient />;
}
