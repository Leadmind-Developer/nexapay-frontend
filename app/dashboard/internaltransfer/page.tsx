"use client";

import React, { useEffect, useState } from "react";
import api from "@/lib/api";

interface User {
  id: string;
  fullName: string;
  username: string;
  wallet: {
    balance: number;
    userId: string;
  };
  virtualAccount?: {
    bankName: string;
    accountNumber: string;
  };
}

interface Recipient {
  id: string;
  fullName: string;
  userID: string;
}

export default function InternalTransferPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const [recipient, setRecipient] = useState("");
  const [recipientInfo, setRecipientInfo] = useState<Recipient | null>(null);
  const [recentRecipients, setRecentRecipients] = useState<Recipient[]>([]);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupError, setLookupError] = useState("");

  const [amount, setAmount] = useState("");
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [processing, setProcessing] = useState(false);
  const [transferSuccess, setTransferSuccess] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  /* ---------------- Fetch user + recent recipients ---------------- */
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get("/wallet/me");
        if (res.data.success) setUser(res.data);

        const recents = await api.get("/wallet/recent-recipients");
        if (recents.data.success) setRecentRecipients(recents.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  /* ---------------- Lookup recipient ---------------- */
  useEffect(() => {
    if (!recipient || recipient.length < 3) {
      setRecipientInfo(null);
      setLookupError("");
      return;
    }

    const timeout = setTimeout(async () => {
      try {
        setLookupLoading(true);
        const res = await api.get("/wallet/user/lookup", {
          params: { username: recipient },
        });

        if (res.data.success && res.data.user) {
          if (res.data.user.id === user?.wallet.userId) {
            setLookupError("You cannot transfer to yourself");
            setRecipientInfo(null);
          } else {
            setRecipientInfo(res.data.user);
            setLookupError("");
          }
        } else {
          setLookupError(res.data.message || "User not found");
          setRecipientInfo(null);
        }
      } catch {
        setRecipientInfo(null);
        setLookupError("User not found");
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

  const canProceed = (() => {
    const raw = getRawAmount();
    if (!recipient) return false;
    if (!recipientInfo) return false;
    if (lookupLoading) return false;
    if (lookupError) return false;
    if (step === 2 && raw <= 0) return false;
    if ((user?.wallet?.balance ?? 0) < raw * 100) return false;
    return true;
  })();

  const handleTransfer = async () => {
    if (!recipientInfo) return;
    const rawAmount = getRawAmount();
    if (rawAmount <= 0) return;

    setProcessing(true);
    try {
      const res = await api.post("/wallet/transfer", {
        toUserId: recipientInfo.id,
        amount: rawAmount * 100,
      });
      if (res.data.success) {
        setTransferSuccess(true);
        setStep(1);
        setRecipient("");
        setRecipientInfo(null);
        setAmount("");
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-900 text-white">
        Loading…
      </div>
    );
  }

  const filteredRecipients = recentRecipients.filter((r) =>
    r.userID.toLowerCase().includes(recipient.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Internal Transfer</h1>

      {user?.virtualAccount && (
        <div className="bg-gray-800 p-4 rounded-xl shadow mb-6">
          <p className="text-gray-300">Your Account</p>
          <p className="text-xl font-bold">
            ₦{(user.wallet.balance / 100).toLocaleString("en-NG")}
          </p>
          <p className="text-gray-400 text-sm">
            {user.virtualAccount.bankName} • {user.virtualAccount.accountNumber}
          </p>
        </div>
      )}

      {/* STEP INDICATOR */}
      <div className="flex gap-2 mb-6">
        {[1, 2, 3].map((n) => (
          <div
            key={n}
            className={`h-2 flex-1 rounded transition-all ${
              step >= n ? "bg-green-600" : "bg-gray-300 dark:bg-gray-700"
            }`}
          />
        ))}
      </div>

      {/* STEP 1: Recipient */}
      {step === 1 && (
        <div className="mb-4 relative">
          <input
            className="w-full p-3 rounded bg-gray-100 dark:bg-gray-800 dark:text-white border border-gray-700"
            placeholder="Enter username"
            value={recipient}
            onChange={(e) => {
              setRecipient(e.target.value.trim().toLowerCase());
              setShowDropdown(true);
            }}
            onFocus={() => setShowDropdown(true)}
            onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
          />

          {showDropdown && filteredRecipients.length > 0 && (
            <div className="fixed inset-0 z-40 bg-black/50 flex items-center justify-center">
              <div className="bg-gray-100 dark:bg-gray-900 w-full max-w-md rounded p-4 z-50">
                {filteredRecipients.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => {
                      setRecipient(r.userID);
                      setShowDropdown(false);
                    }}
                    className="w-full text-left p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-800 dark:text-white"
                  >
                    {r.fullName} (@{r.userID})
                  </button>
                ))}
                <button
                  onClick={() => setShowDropdown(false)}
                  className="mt-3 w-full p-2 text-sm text-gray-500 dark:text-gray-300"
                >
                  Close
                </button>
              </div>
            </div>
          )}

          {lookupLoading && <p className="text-sm text-gray-500 mt-1">Searching…</p>}
          {lookupError && <p className="text-sm text-red-500 mt-1">{lookupError}</p>}
          {recipientInfo && (
            <p className="text-sm text-green-600 mt-1">
              {recipientInfo.fullName} (@{recipientInfo.userID})
            </p>
          )}
        </div>
      )}

      {/* STEP 2: Amount */}
      {step === 2 && (
        <div className="mb-4">
          <input
            className="w-full p-3 rounded bg-gray-100 dark:bg-gray-800 dark:text-white border border-gray-700"
            placeholder="Enter amount"
            value={amount}
            onChange={(e) => setAmount(formatCurrency(e.target.value))}
          />
          {user && getRawAmount() * 100 > user.wallet.balance && (
            <p className="text-sm text-red-500 mt-1">Insufficient balance</p>
          )}
        </div>
      )}

      {/* STEP 3: Confirm */}
      {step === 3 && (
        <div className="mb-4 space-y-2">
          <p>
            <strong>Recipient:</strong> {recipientInfo?.fullName} (@{recipientInfo?.userID})
          </p>
          <p>
            <strong>Amount:</strong> ₦{getRawAmount().toLocaleString("en-NG")}
          </p>
        </div>
      )}

      {/* NAVIGATION */}
      <div className="flex justify-between mt-4">
        {step > 1 && (
          <button
            onClick={() => setStep(step - 1)}
            className="px-4 py-2 rounded bg-gray-700"
          >
            Back
          </button>
        )}
        {step < 3 && (
          <button
            disabled={!canProceed}
            onClick={() => setStep(step + 1)}
            className={`px-4 py-2 rounded ${
              !canProceed ? "bg-gray-600" : "bg-green-600 hover:bg-green-700"
            }`}
          >
            Next
          </button>
        )}
        {step === 3 && (
          <button
            disabled={processing}
            onClick={handleTransfer}
            className={`px-4 py-2 rounded ${
              processing ? "bg-gray-600" : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {processing ? "Processing…" : "Confirm"}
          </button>
        )}
      </div>

      {/* SUCCESS MODAL */}
      {transferSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-green-600 text-white p-6 rounded-xl font-bold">
            Transfer Successful ✅
          </div>
        </div>
      )}
    </div>
  );
}
