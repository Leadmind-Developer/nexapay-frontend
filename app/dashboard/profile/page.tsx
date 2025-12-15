"use client";

import React, { useEffect, useState } from "react";
import { IoPersonCircleOutline } from "react-icons/io5";
import ResponsiveLandingWrapper from "@/components/ResponsiveLandingWrapper";
import api from "@/lib/api";
import { saveToken } from "@/lib/auth";
import OTPInput from "@/components/OTPInput";

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [emailVerified, setEmailVerified] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [bvn, setBvn] = useState("");
  const [nin, setNin] = useState("");
  const [kycCompleted, setKycCompleted] = useState(false);
  const [balance, setBalance] = useState(0);
  const [virtualAccount, setVirtualAccount] = useState<any>(null);

  // OTP state
  const [otpStep, setOtpStep] = useState<"none" | "email" | "phone">("none");
  const [otpValue, setOtpValue] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpMessage, setOtpMessage] = useState("");

  // 2FA state
  const [totpRequired, setTotpRequired] = useState(false);
  const [pushRequired, setPushRequired] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);

  // Load profile
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await api.get("/user/me");
        if (res.data.success) {
          const user = res.data.user;
          const nameParts = user.name?.split(" ") || [];
          setFirstName(nameParts[0] || "");
          setLastName(nameParts[1] || "");
          setEmail(user.email || "");
          setPhone(user.phone || "");
          setEmailVerified(user.emailConfirmed ?? false);
          setPhoneVerified(user.phoneConfirmed ?? false);
          setBvn(user.bvnVerified ? user.bvn || "" : "");
          setNin(user.ninVerified ? user.nin || "" : "");
          setKycCompleted(user.bvnVerified && user.ninVerified);
          setBalance(user.balance || 0);
          setVirtualAccount(user.virtualAccount || null);
        }
      } catch (err) {
        console.error("PROFILE LOAD ERROR:", err);
        alert("Unable to load your profile. Try again later.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Detect biometric support
  useEffect(() => {
    if (window.PublicKeyCredential) setBiometricAvailable(true);
  }, []);

  // -------------------------
  // Save profile changes
  // -------------------------
  const handleSave = async () => {
    try {
      const payload: any = {};
      if (firstName) payload.firstName = firstName;
      if (lastName) payload.lastName = lastName;
      if (!emailVerified && email) payload.email = email;
      if (!phoneVerified && phone) payload.phone = phone;

      const res = await api.put("/user/me", payload);
      if (res.data.success) alert("Profile updated successfully.");
    } catch (err) {
      console.error("PROFILE UPDATE ERROR:", err);
      alert("Failed to update profile.");
    }
  };

  // -------------------------
  // Send OTP / initiate 2FA
  // -------------------------
  const handleSendOtp = async (type: "email" | "phone") => {
    const value = type === "email" ? email : phone;
    if (!value) return alert(`Enter your ${type} first`);

    setOtpLoading(true);
    setOtpMessage("");

    try {
      const res = await api.post("/auth", { [type]: value, mode: "login" });
      const data = res.data;

      if (data.success) {
        if (data.totpRequired || data.pushRequired) {
          setTotpRequired(!!data.totpRequired);
          setPushRequired(!!data.pushRequired);
          setOtpStep(type);
          setOtpMessage("⚡ Additional 2FA required. Approve push or enter TOTP.");
        } else {
          setOtpStep(type);
          setOtpMessage("✅ OTP sent! Check your inbox or phone.");
        }
      } else {
        alert(data.message || "Failed to send OTP.");
      }
    } catch (err: any) {
      alert(err.response?.data?.message || "Error sending OTP.");
    } finally {
      setOtpLoading(false);
    }
  };

  // -------------------------
  // Verify OTP
  // -------------------------
  const handleVerifyOtp = async () => {
    const value = otpStep === "email" ? email : phone;
    if (!otpValue || otpValue.length < 6) return;

    setOtpLoading(true);
    try {
      const res = await api.post("/auth", { [otpStep]: value, otp: otpValue, mode: "login" });
      const data = res.data;

      if (data.success && data.token && otpStep !== "none") {
        finalize2FA(data.token, otpStep);
      } else if (data.totpRequired || data.pushRequired) {
        setTotpRequired(!!data.totpRequired);
        setPushRequired(!!data.pushRequired);
        setOtpMessage("⚡ Additional 2FA required. Approve push or enter TOTP.");
      } else {
        alert(data.message || "Invalid OTP.");
      }
    } catch (err: any) {
      alert(err.response?.data?.message || "OTP verification failed.");
    } finally {
      setOtpLoading(false);
    }
  };

  // -------------------------
  // Handle 2FA verification
  // -------------------------
  const handle2FAVerification = async (totpCode?: string) => {
    if (!otpStep) return;
    setOtpLoading(true);
    try {
      const res = await api.post("/auth/verify-2fa", {
        identifier: otpStep === "email" ? email : phone,
        totp: totpCode,
        push: pushRequired ? true : undefined,
      });
      const data = res.data;

      if (data.success && data.token && otpStep !== "none") {
        finalize2FA(data.token, otpStep);
      } else {
        alert(data.message || "2FA verification failed.");
      }
    } catch (err: any) {
      alert(err.response?.data?.message || "2FA verification failed.");
    } finally {
      setOtpLoading(false);
    }
  };

  const finalize2FA = (token: string, type: "email" | "phone") => {
    saveToken(token);
    alert(`${type.toUpperCase()} verified successfully!`);
    if (type === "email") setEmailVerified(true);
    if (type === "phone") setPhoneVerified(true);
    setOtpStep("none");
    setOtpValue("");
    setTotpRequired(false);
    setPushRequired(false);
    setOtpMessage("");
  };

  if (loading) {
    return (
      <ResponsiveLandingWrapper>
        <div className="flex items-center justify-center h-[60vh]">
          <p className="text-gray-500 animate-pulse">Loading profile...</p>
        </div>
      </ResponsiveLandingWrapper>
    );
  }

  return (
    <ResponsiveLandingWrapper>
      <div className="max-w-3xl mx-auto p-6 space-y-6">
        <div className="bg-blue-600 rounded-2xl text-center py-12 shadow-md">
          <IoPersonCircleOutline className="mx-auto text-white" size={70} />
          <h1 className="mt-4 text-white text-2xl font-bold">Edit Profile</h1>
        </div>

        <div className="space-y-4">
          {/* Names */}
          <label className="block text-gray-600">First Name</label>
          <input
            className="w-full p-3 rounded-lg border border-gray-300"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
          <label className="block text-gray-600">Last Name</label>
          <input
            className="w-full p-3 rounded-lg border border-gray-300"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />

          {/* Email verification */}
          <label className="block text-gray-600">Email</label>
          <div className="flex items-center gap-2">
            <input
              className={`w-full p-3 rounded-lg border ${emailVerified ? "bg-gray-100" : "border-gray-300"}`}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={emailVerified}
            />
            {!emailVerified && (
              <button
                className="text-blue-600"
                onClick={() => handleSendOtp("email")}
                disabled={otpLoading}
              >
                Verify
              </button>
            )}
          </div>

          {/* Phone verification */}
          <label className="block text-gray-600">Phone</label>
          <div className="flex items-center gap-2">
            <input
              className={`w-full p-3 rounded-lg border ${phoneVerified ? "bg-gray-100" : "border-gray-300"}`}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={phoneVerified}
            />
            {!phoneVerified && (
              <button
                className="text-blue-600"
                onClick={() => handleSendOtp("phone")}
                disabled={otpLoading}
              >
                Verify
              </button>
            )}
          </div>

          {/* OTP / 2FA inputs */}
          {otpStep !== "none" && (
            <div className="mt-2">
              {totpRequired && (
                <>
                  <p className="text-sm text-gray-700 mb-1">Enter code from authenticator app</p>
                  <OTPInput length={6} value={otpValue} onChange={setOtpValue} disabled={otpLoading} />
                  <button
                    className="mt-2 py-2 px-4 bg-purple-600 text-white rounded"
                    onClick={() => handle2FAVerification(otpValue)}
                    disabled={otpLoading || otpValue.length < 6}
                  >
                    {otpLoading ? "Verifying..." : "Verify TOTP"}
                  </button>
                </>
              )}
              {pushRequired && (
                <>
                  <p className="text-sm text-gray-700 mt-2">A push notification has been sent. Approve to continue.</p>
                  {biometricAvailable && <p className="text-sm text-gray-500">Or use device biometric (TouchID / FaceID)</p>}
                  <button
                    className="mt-2 py-2 px-4 bg-indigo-600 text-white rounded"
                    onClick={() => handle2FAVerification()}
                    disabled={otpLoading}
                  >
                    {otpLoading ? "Waiting..." : "Confirm Push / Biometric"}
                  </button>
                </>
              )}
              {otpMessage && <p className="text-sm text-green-600 mt-1">{otpMessage}</p>}
            </div>
          )}

          {/* BVN / NIN */}
          <label className="block text-gray-600 mt-4">BVN</label>
          <input className="w-full p-3 rounded-lg border bg-gray-100" value={bvn} disabled />
          <label className="block text-gray-600">NIN</label>
          <input className="w-full p-3 rounded-lg border bg-gray-100" value={nin} disabled />

          {/* Wallet */}
          <label className="block text-gray-600 mt-4">Wallet Balance</label>
          <p className="font-semibold">₦{balance.toLocaleString()}</p>

          {/* Virtual Account */}
          {virtualAccount && (
            <>
              <label className="block text-gray-600 mt-4">Virtual Account</label>
              <p>{virtualAccount.accountNumber} - {virtualAccount.bank}</p>
              <p>Name: {virtualAccount.name}</p>
            </>
          )}

          <button
            className="w-full mt-4 py-3 bg-blue-600 text-white rounded-lg"
            onClick={handleSave}
          >
            Save Changes
          </button>
        </div>
      </div>
    </ResponsiveLandingWrapper>
  );
}
