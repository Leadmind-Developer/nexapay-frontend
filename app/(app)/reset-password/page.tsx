"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AuthPage from "@/components/AuthPage";
import api from "@/lib/api";

export default function ResetPasswordPage() {
  const router = useRouter();

  const [step, setStep] = useState<"identifier" | "reset">("identifier");

  const [identifier, setIdentifier] = useState("");
  const [otp, setOtp] = useState("");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [resendTimer, setResendTimer] = useState(0);


  async function handleSendOtp() {

    if (!identifier.trim()) {
      setError("Enter your email, phone or username");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    try {

      const { data } = await api.post("/auth/forgot", {
        identifier: identifier.trim().toLowerCase(),
      });


      if (!data.success) {
        setError(data.message || "Failed to send OTP");
        return;
      }


      setStep("reset");
      setMessage("OTP sent. Check your email or phone.");
      setResendTimer(30);


    } catch (err:any) {

      setError(
        err.response?.data?.message || "Failed to send OTP"
      );

    } finally {
      setLoading(false);
    }
  }



  async function handleResetPassword() {

    if (!otp || !newPassword || !confirmPassword) {
      setError("All fields are required");
      return;
    }


    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }


    setLoading(true);
    setError("");
    setMessage("");


    try {

      const { data } = await api.post("/auth/reset", {
        identifier,
        otp,
        newPassword,
      });


      if (!data.success) {
        setError(data.message || "Reset failed");
        return;
      }


      setMessage(
        "Password reset successful. Redirecting..."
      );


      setTimeout(() => {
        router.push("/login");
      }, 1200);


    } catch(err:any) {

      setError(
        err.response?.data?.message || "Reset failed"
      );

    } finally {
      setLoading(false);
    }
  }



  useEffect(() => {

    if(resendTimer <= 0) return;

    const timer = setInterval(() => {
      setResendTimer(t => t - 1);
    },1000);


    return () => clearInterval(timer);

  },[resendTimer]);



  return (

    <AuthPage
      videoSrc="/videos/login-bg.mp4"
      imageSrc="/images/login-bg.jpg"
    >


      <div
        className="
        max-w-md
        mx-auto
        bg-white
        dark:bg-gray-800
        rounded-2xl
        shadow
        p-6
        space-y-6
        "
      >


        <h1 className="text-2xl font-semibold text-center">

          {step === "identifier"
            ? "Forgot Password"
            : "Reset Password"}

        </h1>



        {step === "identifier" && (

          <>


            <p className="text-center text-sm text-gray-500">
              Enter your email, phone or username.
            </p>


            <input
              className="
              w-full
              p-3
              border
              rounded-lg
              dark:bg-gray-700
              "
              placeholder="Email / Phone / Username"
              value={identifier}
              onChange={(e)=>
                setIdentifier(
                  e.target.value.toLowerCase().replace(/\s/g,"")
                )
              }
            />


            <button
              onClick={handleSendOtp}
              disabled={loading || !identifier}
              className="
              w-full
              py-3
              bg-blue-600
              text-white
              rounded-lg
              disabled:opacity-50
              "
            >
              {loading ? "Sending..." : "Send OTP"}

            </button>


            <div className="text-center text-sm">

              <a
                href="/login"
                className="text-blue-600 hover:underline"
              >
                Back to login
              </a>

            </div>


          </>

        )}




        {step === "reset" && (

          <>


            <input
              className="
              w-full
              p-3
              border
              rounded-lg
              "
              placeholder="OTP"
              value={otp}
              onChange={(e)=>setOtp(e.target.value)}
            />



            <div className="relative">

              <input
                type={showPassword ? "text":"password"}
                className="
                w-full
                p-3
                border
                rounded-lg
                "
                placeholder="New Password"
                value={newPassword}
                onChange={(e)=>setNewPassword(e.target.value)}
              />


              <button
                type="button"
                className="absolute right-3 top-3 text-gray-500"
                onClick={() =>
                  setShowPassword(!showPassword)
                }
              >
                {showPassword ? "Hide":"Show"}

              </button>

            </div>




            <div className="relative">

              <input
                type={showConfirmPassword ? "text":"password"}
                className="
                w-full
                p-3
                border
                rounded-lg
                "
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e)=>setConfirmPassword(e.target.value)}
              />


              <button
                type="button"
                className="absolute right-3 top-3 text-gray-500"
                onClick={() =>
                  setShowConfirmPassword(!showConfirmPassword)
                }
              >
                {showConfirmPassword ? "Hide":"Show"}

              </button>

            </div>




            <button
              onClick={handleResetPassword}
              disabled={
                loading ||
                !otp ||
                !newPassword ||
                !confirmPassword
              }
              className="
              w-full
              py-3
              bg-blue-600
              text-white
              rounded-lg
              disabled:opacity-50
              "
            >
              {loading ? "Resetting..." : "Reset Password"}

            </button>




            {resendTimer > 0 ? (

              <p className="text-center text-sm text-gray-500">

                Resend OTP in {resendTimer}s

              </p>

            ) : (

              <button
                onClick={handleSendOtp}
                className="
                block
                mx-auto
                text-sm
                text-blue-600
                hover:underline
                "
              >
                Resend OTP
              </button>

            )}

          </>

        )}




        {message && (
          <p className="text-center text-sm text-green-600">
            {message}
          </p>
        )}


        {error && (
          <p className="text-center text-sm text-red-600">
            {error}
          </p>
        )}


      </div>


    </AuthPage>

  );
}
