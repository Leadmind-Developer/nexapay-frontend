"use client";

import React, { useEffect, useState } from "react";
import { IoPersonCircleOutline, IoKeyOutline } from "react-icons/io5";
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
  const [otpStep, setOtpStep] = useState<"none" | "email" | "phone">("none");
  const [otpValue, setOtpValue] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpMessage, setOtpMessage] = useState("");

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
  // Send OTP for verification
  // -------------------------
  const handleSendOtp = async (type: "email" | "phone") => {
    const value = type === "email" ? email : phone;
    if (!value) return alert(`Enter your ${type} first`);
    setOtpLoading(true);
    setOtpMessage("");

    try {
      const res = await api.post("/auth", { [type]: value, mode: "login" });
      if (res.data.success) {
        setOtpStep(type);
        setOtpMessage("✅ OTP sent! Check your inbox or phone.");
      } else {
        alert(res.data.message || "Failed to send OTP.");
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
      if (res.data.success && res.data.token) {
        saveToken(res.data.token);
        alert(`${otpStep.toUpperCase()} verified successfully!`);
        if (otpStep === "email") setEmailVerified(true);
        if (otpStep === "phone") setPhoneVerified(true);
        setOtpStep("none");
        setOtpValue("");
      } else {
        alert(res.data.message || "Invalid OTP.");
      }
    } catch (err: any) {
      alert(err.response?.data?.message || "OTP verification failed.");
    } finally {
      setOtpLoading(false);
    }
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
          {/* Name */}
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

          {/* Email */}
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
          {otpStep === "email" && (
            <div className="mt-2">
              <OTPInput length={6} value={otpValue} onChange={setOtpValue} disabled={otpLoading} />
              <button
                className="mt-2 py-2 px-4 bg-green-600 text-white rounded"
                onClick={handleVerifyOtp}
                disabled={otpLoading || otpValue.length < 6}
              >
                {otpLoading ? "Verifying..." : "Submit OTP"}
              </button>
              {otpMessage && <p className="text-sm text-green-600 mt-1">{otpMessage}</p>}
            </div>
          )}

          {/* Phone */}
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
          {otpStep === "phone" && (
            <div className="mt-2">
              <OTPInput length={6} value={otpValue} onChange={setOtpValue} disabled={otpLoading} />
              <button
                className="mt-2 py-2 px-4 bg-green-600 text-white rounded"
                onClick={handleVerifyOtp}
                disabled={otpLoading || otpValue.length < 6}
              >
                {otpLoading ? "Verifying..." : "Submit OTP"}
              </button>
              {otpMessage && <p className="text-sm text-green-600 mt-1">{otpMessage}</p>}
            </div>
          )}

          {/* BVN/NIN */}
          <label className="block text-gray-600 mt-4">BVN</label>
          <input
            className="w-full p-3 rounded-lg border bg-gray-100"
            value={bvn}
            disabled
          />
          <label className="block text-gray-600">NIN</label>
          <input
            className="w-full p-3 rounded-lg border bg-gray-100"
            value={nin}
            disabled
          />

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
