// ./app/otp/page.tsx
import OTPClient from "./OTPClient";

// Make page dynamic to prevent prerender errors
export const dynamic = "force-dynamic";

export default function OTPPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-2xl font-bold mb-4">Enter OTP</h1>
      <OTPClient
        onChange={(otp) => {
          console.log("OTP entered:", otp);
        }}
      />
    </div>
  );
}
