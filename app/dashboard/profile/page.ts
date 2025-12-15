"use client";

import React, { useEffect, useState } from "react";
import { IoPersonCircleOutline, IoKeyOutline } from "react-icons/io5";
import ResponsiveLandingWrapper from "@/components/ResponsiveLandingWrapper";
import api from "@/lib/api";
import { SessionManager } from "@/lib/SessionManager";
import { useOTPController } from "@/lib/profile/useOTPController";
import OTPModal from "@/lib/profile/OTPModal";

export default function ProfilePage() {
  const otp = useOTPController();

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
  const [biometricsEnabled, setBiometricsEnabled] = useState(false);
  const [pinIsSet, setPinIsSet] = useState(false);

  // Register OTP verified callback
  useEffect(() => {
    otp.setOnVerified((type) => {
      if (type === "email") setEmailVerified(true);
      if (type === "phone") setPhoneVerified(true);
    });
  }, [otp]);

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
        const bio = await SessionManager.isBiometricEnabled();
        setBiometricsEnabled(bio);
        const pinFlag = await SessionManager.isPinSet();
        setPinIsSet(pinFlag);
      } catch (err) {
        console.error("PROFILE LOAD ERROR:", err);
        alert("Unable to load your profile. Try again later.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

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

  const handleVerify = async (type: "email" | "phone") => {
    const value = type === "email" ? email : phone;
    if (!value) return alert(`Enter your ${type} first`);
    await otp.open({ type, value });
  };

  const toggleBiometrics = async (value: boolean) => {
    if (value) {
      const result = await SessionManager.authenticateWithBiometrics(
        "Enable biometric login"
      );
      if (!result.success) return alert("Biometric authentication failed.");
    }
    await SessionManager.setBiometricEnabled(value);
    setBiometricsEnabled(value);
    alert(`Biometric login ${value ? "enabled" : "disabled"}.`);
  };

  const handleResetPin = async () => {
    if (!confirm("This will remove your transaction PIN. Proceed?")) return;
    await SessionManager.clearPin();
    setPinIsSet(false);
    alert("Your transaction PIN has been reset.");
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
      <OTPModal {...otp} />
      <div className="max-w-3xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="bg-blue-600 dark:bg-blue-700 rounded-2xl text-center py-12 shadow-md">
          <IoPersonCircleOutline className="mx-auto text-white" size={70} />
          <h1 className="mt-4 text-white text-2xl font-bold">Edit Profile</h1>
        </div>

        {/* Form */}
        <div className="space-y-4">
          {/* Names */}
          <label className="block text-gray-600 dark:text-gray-300">First Name</label>
          <input
            className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="Enter first name"
          />
          <label className="block text-gray-600 dark:text-gray-300">Last Name</label>
          <input
            className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Enter last name"
          />

          {/* Email */}
          <label className="block text-gray-600 dark:text-gray-300">Email</label>
          <div className="flex items-center gap-2">
            <input
              className={`w-full p-3 rounded-lg border ${emailVerified ? "bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600" : "border-gray-300 dark:border-gray-600"}`}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={emailVerified}
              placeholder="Enter your email"
            />
            {email && !emailVerified && (
              <button
                className="text-blue-600 dark:text-blue-400"
                onClick={() => handleVerify("email")}
              >
                Verify
              </button>
            )}
          </div>
          {email && (
            <p className={`text-sm ${emailVerified ? "text-green-600" : "text-red-600"}`}>
              {emailVerified ? "Verified" : "Not Verified"}
            </p>
          )}

          {/* Phone */}
          <label className="block text-gray-600 dark:text-gray-300">Phone</label>
          <div className="flex items-center gap-2">
            <input
              className={`w-full p-3 rounded-lg border ${phoneVerified ? "bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600" : "border-gray-300 dark:border-gray-600"}`}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={phoneVerified}
              placeholder="Enter your phone"
            />
            {phone && !phoneVerified && (
              <button
                className="text-blue-600 dark:text-blue-400"
                onClick={() => handleVerify("phone")}
              >
                Verify
              </button>
            )}
          </div>
          {phone && (
            <p className={`text-sm ${phoneVerified ? "text-green-600" : "text-red-600"}`}>
              {phoneVerified ? "Verified" : "Not Verified"}
            </p>
          )}

          {/* BVN / NIN */}
          <label className="block text-gray-600 dark:text-gray-300">BVN</label>
          <input
            className={`w-full p-3 rounded-lg border ${kycCompleted ? "bg-gray-100 dark:bg-gray-700" : "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"}`}
            value={bvn}
            disabled
            placeholder={kycCompleted ? "" : "Complete KYC to view"}
          />
          <label className="block text-gray-600 dark:text-gray-300">NIN</label>
          <input
            className={`w-full p-3 rounded-lg border ${kycCompleted ? "bg-gray-100 dark:bg-gray-700" : "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"}`}
            value={nin}
            disabled
            placeholder={kycCompleted ? "" : "Complete KYC to view"}
          />

          {/* Wallet */}
          <label className="block text-gray-600 dark:text-gray-300 mt-4">Wallet Balance</label>
          <p className="font-semibold">₦{balance.toLocaleString()}</p>

          {/* Virtual Account */}
          {virtualAccount && (
            <>
              <label className="block text-gray-600 dark:text-gray-300 mt-4">Virtual Account</label>
              <p>{virtualAccount.accountNumber} - {virtualAccount.bank}</p>
              <p>Name: {virtualAccount.name}</p>
            </>
          )}

          {/* Biometrics */}
          <div className="flex justify-between items-center mt-4 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600">
            <span>Enable FaceID / Fingerprint</span>
            <input
              type="checkbox"
              checked={biometricsEnabled}
              onChange={(e) => toggleBiometrics(e.target.checked)}
              className="w-5 h-5 accent-blue-600"
            />
          </div>

          {/* Reset PIN */}
          <button
            className="flex items-center justify-center gap-2 w-full mt-4 py-3 bg-blue-600 dark:bg-blue-700 text-white rounded-lg"
            onClick={handleResetPin}
          >
            <IoKeyOutline size={20} />
            {pinIsSet ? "Reset PIN" : "No PIN Set"}
          </button>

          {/* Save */}
          <button
            className="w-full mt-4 py-3 bg-blue-600 dark:bg-blue-700 text-white rounded-lg"
            onClick={handleSave}
          >
            Save Changes
          </button>
        </div>
      </div>
    </ResponsiveLandingWrapper>
  );
}
