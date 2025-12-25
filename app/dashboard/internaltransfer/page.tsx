"use client";

import React, { useState, useEffect, Fragment } from "react";
import api from "@/lib/api";
import { Dialog, Transition } from "@headlessui/react";

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
  const [showModal, setShowModal] = useState(false);
  const [transferSuccess, setTransferSuccess] = useState(false);
  const [step, setStep] = useState(1);

  // Fetch current user & wallet info
  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const res = await api.get("/wallet/me");
        if (res.data.success) setUser(res.data);
        setRecentRecipients(["alice", "bob", "charlie"]);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  // Lookup recipient
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
          if (res.data.user.id === user?.wallet?.userId) {
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

  const handleTransfer = async () => {
    if (!recipientInfo) return;
    const rawAmount = getRawAmount();
    if (rawAmount <= 0) return;

    setProcessing(true);
    try {
      const payload = { toUserId: recipientInfo.id, amount: rawAmount * 100 };
      const res = await api.post("/wallet/transfer", payload);
      if (res.data.success) {
        setTransferSuccess(true);
        setShowModal(false);
        setStep(1);
        setTimeout(() => setTransferSuccess(false), 2000);
      } else {
        alert(res.data.message || "Transfer failed");
      }
    } catch (err: any) {
      alert(err?.response?.data?.message || "Transfer failed");
    } finally {
      setProcessing(false);
    }
  };

  const { disabled, tooltip } = (() => {
    const rawAmount = getRawAmount();
    if (!recipient) return { disabled: true, tooltip: "Enter username" };
    if (lookupLoading) return { disabled: true, tooltip: "Searching..." };
    if (lookupError) return { disabled: true, tooltip: lookupError };
    if (!recipientInfo) return { disabled: true, tooltip: "Invalid user" };
    if (!rawAmount) return { disabled: true, tooltip: "Enter amount" };
    if ((user?.wallet?.balance ?? 0) < rawAmount * 100)
      return { disabled: true, tooltip: "Insufficient balance" };
    return { disabled: false, tooltip: "" };
  })();

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen bg-gray-900 text-white">
        Loading...
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Internal Transfer</h1>

      {/* User Card */}
      {user?.virtualAccount && (
        <div className="bg-gray-800 p-4 rounded-xl shadow mb-6">
          <p className="font-semibold text-gray-300">Your Account</p>
          <p className="text-xl font-bold mt-1">
            ₦{(user.wallet.balance / 100).toLocaleString("en-NG")}
          </p>
          <p className="text-gray-400 mt-1">
            {user.virtualAccount.bankName} - {user.virtualAccount.accountNumber}
          </p>
        </div>
      )}

      {/* Recent Recipients */}
      {recentRecipients.length > 0 && (
        <div className="mb-4">
          <p className="font-semibold mb-2">Recent Recipients</p>
          <div className="flex gap-2 overflow-x-auto">
            {recentRecipients.map((r) => (
              <button
                key={r}
                className="px-3 py-1 rounded-full bg-gray-700 hover:bg-gray-600"
                onClick={() => setRecipient(r)}
              >
                @{r}
              </button>
            ))}
          </div>
        </div>
      )}

      <button
        disabled={disabled || processing}
        onClick={() => setShowModal(true)}
        className={`w-full p-3 rounded-lg text-white font-bold ${
          disabled || processing ? "bg-gray-600" : "bg-blue-600 hover:bg-blue-700"
        }`}
      >
        {processing ? "Processing..." : "Proceed"}
      </button>

      {/* 3-Step Modal */}
<Transition appear show={showModal} as={Fragment}>
  <Dialog as="div" className="relative z-10" onClose={() => setShowModal(false)}>
    <Transition.Child
      as={Fragment}
      enter="ease-out duration-300"
      enterFrom="opacity-0"
      enterTo="opacity-100"
      leave="ease-in duration-200"
      leaveFrom="opacity-100"
      leaveTo="opacity-0"
    >
      <div className="fixed inset-0 bg-black bg-opacity-60" />
    </Transition.Child>

    <div className="fixed inset-0 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4 text-center">
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0 scale-95"
          enterTo="opacity-100 scale-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100 scale-100"
          leaveTo="opacity-0 scale-95"
        >
          <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-gray-800 p-6 text-left align-middle shadow-xl transition-all">
            
            {/* Step Indicator with Animated Progress */}
  <div className="mb-6 relative">
    <div className="absolute top-4 left-0 w-full h-1 bg-gray-600 rounded-full z-0" />
    <div
      className="absolute top-4 left-0 h-1 bg-green-500 rounded-full transition-all duration-500 ease-in-out z-0"
      style={{ width: `${((step - 1) / 2) * 100}%` }}
    />
    <div className="relative flex justify-between items-center">
      {[1, 2, 3].map((s) => (
        <div key={s} className="flex-1 flex justify-center items-center relative z-10">
          <div
            className={`w-8 h-8 flex items-center justify-center rounded-full border-2 text-white font-bold transition-colors duration-300 ${
              step === s
                ? "border-blue-600 bg-blue-600"
                : s < step
                ? "border-green-500 bg-green-500"
                : "border-gray-600 bg-gray-800"
            }`}
          >
            {s}
          </div>
        </div>
      ))}
    </div>
  </div>

            <Dialog.Title className="text-lg font-bold text-white mb-4">
              {step === 1 && "Step 1: Recipient"}
              {step === 2 && "Step 2: Amount"}
              {step === 3 && "Step 3: Confirm"}
            </Dialog.Title>

            {/* Step Content */}
            {step === 1 && (
              <div className="space-y-4">
                <input
                  className={`w-full p-3 rounded-lg bg-gray-900 border ${
                    recipient && lookupError
                      ? "border-red-500"
                      : recipient && recipientInfo
                      ? "border-green-500"
                      : "border-gray-700"
                  }`}
                  placeholder="Enter username"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value.trim().toLowerCase())}
                />
                {lookupLoading && <p className="text-blue-400">Searching…</p>}
                {lookupError && <p className="text-red-500">{lookupError}</p>}
                {recipientInfo && (
                  <div className="p-3 bg-gray-800 rounded-lg border border-gray-700">
                    <p className="font-semibold">{recipientInfo.fullName}</p>
                    <p>@{recipientInfo.userID}</p>
                  </div>
                )}
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <input
                  className="w-full p-3 border rounded-lg bg-gray-900 border-gray-700"
                  placeholder="Enter amount"
                  value={amount}
                  onChange={(e) => setAmount(formatCurrency(e.target.value))}
                />
                {disabled && tooltip && <p className="text-red-500">{tooltip}</p>}
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <p>
                  <span className="font-semibold">To:</span> {recipientInfo?.fullName} (@{recipientInfo?.userID})
                </p>
                <p>
                  <span className="font-semibold">Amount:</span> ₦{getRawAmount().toLocaleString("en-NG")}
                </p>
              </div>
            )}

            {/* Modal Navigation */}
            <div className="flex justify-between mt-6">
              {step > 1 ? (
                <button
                  onClick={() => setStep(step - 1)}
                  className="px-4 py-2 rounded-lg bg-gray-600 hover:bg-gray-700"
                >
                  Back
                </button>
              ) : (
                <div />
              )}
              {step < 3 ? (
                <button
                  onClick={() => setStep(step + 1)}
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold"
                  disabled={
                    (step === 1 && (!recipientInfo || lookupError)) ||
                    (step === 2 && getRawAmount() <= 0) ||
                    processing
                  }
                >
                  Next
                </button>
              ) : (
                <button
                  onClick={handleTransfer}
                  className="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white font-bold"
                  disabled={processing}
                >
                  {processing ? "Processing..." : "Confirm"}
                </button>
              )}
            </div>
          </Dialog.Panel>
        </Transition.Child>
      </div>
    </div>
  </Dialog>
</Transition>

      {/* Success Message */}
      {transferSuccess && (
        <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-50">
          <div className="bg-green-600 p-6 rounded-xl text-white font-bold text-center">
            Transfer Successful ✅
          </div>
        </div>
      )}
    </div>
  );
}
