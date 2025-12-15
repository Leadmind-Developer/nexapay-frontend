"use client";

import React, { useState, useEffect } from "react";
import api from "@/lib/api";
import { CheckCircleIcon } from "@heroicons/react/24/outline"; // simple web icon

export default function InternalTransferPage() {
  const [recipient, setRecipient] = useState("");
  const [recentRecipients, setRecentRecipients] = useState<string[]>([]);
  const [recipientInfo, setRecipientInfo] = useState<any>(null);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupError, setLookupError] = useState("");
  const [amount, setAmount] = useState("");
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const res = await api.get("/user/me");
        if (res.data.success) setUser(res.data.user);
        setRecentRecipients(["alice", "bob", "charlie"]);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  // Recipient lookup
  useEffect(() => {
    if (!recipient || recipient.length < 3) {
      setRecipientInfo(null);
      setLookupError("");
      return;
    }
    const timeout = setTimeout(async () => {
      try {
        setLookupLoading(true);
        const res = await api.get(`/wallet/user/lookup?username=${recipient}`);
        if (res.data.success && res.data.user) {
          if (res.data.user.userID === user.userID) {
            setLookupError("You cannot transfer to yourself");
            setRecipientInfo(null);
          } else {
            setRecipientInfo(res.data.user);
            setLookupError("");
          }
        } else {
          setLookupError("User not found");
          setRecipientInfo(null);
        }
      } catch {
        setLookupError("User not found");
        setRecipientInfo(null);
      } finally {
        setLookupLoading(false);
      }
    }, 500);
    return () => clearTimeout(timeout);
  }, [recipient, user]);

  const formatCurrency = (raw: string) => {
    const num = Number(raw.replace(/,/g, ""));
    if (isNaN(num)) return "";
    return num.toLocaleString("en-NG");
  };

  const getRawAmount = () => Number(amount.replace(/,/g, "")) || 0;

  const handleSubmit = async () => {
    if (!recipientInfo) return alert("Select a valid recipient");
    const rawAmount = getRawAmount();
    if (rawAmount <= 0) return alert("Enter a valid amount");

    if ((user?.balance ?? 0) < rawAmount * 100) return alert("Insufficient balance");

    setProcessing(true);
    try {
      const payload = { toUserId: recipientInfo.userID, amount: rawAmount * 100 };
      const res = await api.post("/wallet/transfer", payload);
      if (res.data.success) {
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 2000);
      } else {
        alert(res.data.message || "Transfer failed");
      }
    } catch (err: any) {
      alert(err?.response?.data?.message || "Transfer failed");
    } finally {
      setProcessing(false);
    }
  };

  if (loading)
    return <div className="flex justify-center items-center h-screen">Loading...</div>;

  if (showSuccess)
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-gray-50">
        <CheckCircleIcon className="w-20 h-20 text-green-500" />
        <h2 className="text-2xl font-bold mt-4">Transfer Successful!</h2>
      </div>
    );

  const { disabled, tooltip } = (() => {
    const rawAmount = getRawAmount();
    if (!recipient) return { disabled: true, tooltip: "Enter username" };
    if (lookupLoading) return { disabled: true, tooltip: "Searching..." };
    if (lookupError) return { disabled: true, tooltip: lookupError };
    if (!recipientInfo) return { disabled: true, tooltip: "Invalid user" };
    if (!rawAmount) return { disabled: true, tooltip: "Enter amount" };
    if ((user?.balance ?? 0) < rawAmount * 100) return { disabled: true, tooltip: "Insufficient balance" };
    return { disabled: false, tooltip: "" };
  })();

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Transfer to Nexa User</h1>

      <div className="mb-4">
        <p className="font-semibold">Your Balance</p>
        <p className="text-xl font-bold">₦{((user?.balance ?? 0) / 100).toLocaleString("en-NG")}</p>
      </div>

      {recentRecipients.length > 0 && (
        <div className="mb-4">
          <p className="font-semibold mb-2">Recent Recipients</p>
          <div className="flex gap-2 overflow-x-auto">
            {recentRecipients.map((r) => (
              <button
                key={r}
                className="px-3 py-1 rounded-full bg-gray-200 hover:bg-gray-300"
                onClick={() => setRecipient(r)}
              >
                @{r}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="mb-4">
        <label className="block font-semibold mb-1">Recipient Username</label>
        <input
          className={`w-full p-3 border rounded-lg ${recipient && lookupError ? "border-red-500" : ""} ${
            recipient && recipientInfo ? "border-green-500" : ""
          }`}
          placeholder="Enter username"
          value={recipient}
          onChange={(e) => setRecipient(e.target.value.trim().toLowerCase())}
        />
        {lookupLoading && <p className="text-blue-600 mt-1">Searching…</p>}
        {lookupError && <p className="text-red-600 mt-1">{lookupError}</p>}
        {recipientInfo && (
          <div className="p-3 bg-blue-50 rounded-lg mt-2">
            <p className="font-semibold">{recipientInfo.fullName}</p>
            <p>@{recipientInfo.userID}</p>
            <p>
              Naira Account:{" "}
              {recipientInfo.titanAccountNumber ? (
                <span className="text-green-600 font-bold">Setup</span>
              ) : (
                <span className="text-red-600 font-bold">Not Setup</span>
              )}
            </p>
          </div>
        )}
      </div>

      <div className="mb-4">
        <label className="block font-semibold mb-1">Amount (₦)</label>
        <input
          className="w-full p-3 border rounded-lg"
          placeholder="Enter amount"
          value={amount}
          onChange={(e) => setAmount(formatCurrency(e.target.value))}
        />
        {disabled && tooltip && <p className="text-red-500 mt-1">{tooltip}</p>}
      </div>

      <button
        disabled={disabled || processing}
        onClick={handleSubmit}
        className={`w-full p-3 rounded-lg text-white font-bold ${
          disabled || processing ? "bg-gray-400" : "bg-blue-700 hover:bg-blue-800"
        }`}
      >
        {processing ? "Processing..." : "Send Money"}
      </button>
    </div>
  );
}
