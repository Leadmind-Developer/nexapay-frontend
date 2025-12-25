"use client";

import React, { useEffect, useState } from "react";
import api from "@/lib/api";

type Bank = {
  name: string;
  code: string;
};

type Beneficiary = {
  id: number;
  bankName: string;
  bankCode: string;
  accountNumber: string;
  accountName: string;
};

export default function WithdrawPage() {
  /* ---------------- STATE ---------------- */
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  const [banks, setBanks] = useState<Bank[]>([]);
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);

  const [bankModal, setBankModal] = useState(false);
  const [bankSearch, setBankSearch] = useState("");

  const [bankCode, setBankCode] = useState("");
  const [bankName, setBankName] = useState("");

  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [isValidAccount, setIsValidAccount] = useState(false);

  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  const [pendingRef, setPendingRef] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  /* ---------------- FETCH DATA ---------------- */
  useEffect(() => {
    api.get("/paystack/banks")
      .then(res => setBanks(res.data.data || []))
      .catch(() => setError("Failed to load banks"));

    api.get("/beneficiaries")
      .then(res => res.data.success && setBeneficiaries(res.data.data))
      .catch(() => {});
  }, []);

  /* ---------------- VERIFY ACCOUNT ---------------- */
  useEffect(() => {
    if (accountNumber.length !== 10 || !bankCode) {
      setAccountName("");
      setIsValidAccount(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setVerifying(true);
        const res = await api.get(
          `/paystack/resolve-account?account_number=${accountNumber}&bank_code=${bankCode}`
        );

        if (res.data?.success) {
          setAccountName(res.data.data.account_name);
          setIsValidAccount(true);
        } else {
          setAccountName("");
          setIsValidAccount(false);
        }
      } catch {
        setAccountName("");
        setIsValidAccount(false);
      } finally {
        setVerifying(false);
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [accountNumber, bankCode]);

  /* ---------------- ACTIONS ---------------- */
  const submitWithdrawal = async () => {
    setError(null);

    const amountKobo = Math.round(Number(amount) * 100);
    if (!isValidAccount) return setError("Invalid bank account");
    if (amountKobo < 10000) return setError("Minimum withdrawal is ₦100");

    try {
      setLoading(true);

      const res = await api.post("/wallet/withdraw", {
        bankCode,
        accountNumber,
        accountName,
        amount: amountKobo, // ✅ BACKEND EXPECTS KOBO
      });

      if (!res.data.success) throw new Error(res.data.message);

      setPendingRef(res.data.transferReference);
      setStep(4);
    } catch (err: any) {
      setError(err.message || "Withdrawal failed");
    } finally {
      setLoading(false);
    }
  };

  const useBeneficiary = (b: Beneficiary) => {
    setBankCode(b.bankCode);
    setBankName(b.bankName);
    setAccountNumber(b.accountNumber);
    setAccountName(b.accountName);
    setIsValidAccount(true);
    setStep(3);
  };

  const filteredBanks = banks.filter(b =>
    b.name.toLowerCase().includes(bankSearch.toLowerCase())
  );

  /* ---------------- UI ---------------- */
  return (
    <div className="max-w-lg mx-auto p-6">
      <h1 className="text-xl font-semibold mb-4 dark:text-white">
        Withdraw to Bank
      </h1>

      {/* STEP INDICATOR */}
      <div className="flex gap-2 mb-6">
        {[1, 2, 3, 4].map(n => (
          <div
            key={n}
            className={`h-2 flex-1 rounded transition-all ${
              step >= n ? "bg-green-600" : "bg-gray-300 dark:bg-gray-700"
            }`}
          />
        ))}
      </div>

      {/* STEP 1 – BANK */}
      {step === 1 && (
        <div>
          <button
            onClick={() => setBankModal(true)}
            className="w-full p-3 rounded bg-gray-100 dark:bg-gray-800 dark:text-white"
          >
            {bankName || "Select Bank"}
          </button>

          <button
            disabled={!bankCode}
            onClick={() => setStep(2)}
            className="mt-4 w-full bg-green-600 text-white p-3 rounded disabled:opacity-40"
          >
            Continue
          </button>
        </div>
      )}

      {/* STEP 2 – ACCOUNT */}
      {step === 2 && (
        <div>
          <input
            value={accountNumber}
            onChange={e => setAccountNumber(e.target.value)}
            placeholder="Account Number"
            className="w-full p-3 rounded bg-gray-100 dark:bg-gray-800 dark:text-white"
          />

          <div className="mt-2 text-sm">
            {verifying && <span className="text-gray-500">Verifying…</span>}
            {isValidAccount && (
              <span className="text-green-600">{accountName}</span>
            )}
          </div>

          <button
            disabled={!isValidAccount}
            onClick={() => setStep(3)}
            className="mt-4 w-full bg-green-600 text-white p-3 rounded disabled:opacity-40"
          >
            Continue
          </button>
        </div>
      )}

      {/* STEP 3 – AMOUNT */}
      {step === 3 && (
        <div>
          <input
            type="number"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            placeholder="Amount (₦)"
            className="w-full p-3 rounded bg-gray-100 dark:bg-gray-800 dark:text-white"
          />

          {error && (
            <div className="mt-2 text-sm text-red-500">{error}</div>
          )}

          <button
            onClick={submitWithdrawal}
            disabled={loading}
            className="mt-4 w-full bg-green-600 text-white p-3 rounded"
          >
            {loading ? "Processing…" : "Confirm Withdrawal"}
          </button>
        </div>
      )}

      {/* STEP 4 – PENDING */}
      {step === 4 && (
        <div className="bg-yellow-100 dark:bg-yellow-900 text-yellow-900 dark:text-yellow-100 p-4 rounded">
          <p className="font-medium">Withdrawal Initiated</p>
          <p className="text-sm mt-1">
            Your wallet will be debited once Paystack confirms the transfer.
          </p>
          <p className="text-xs mt-2">Ref: {pendingRef}</p>
        </div>
      )}

      {/* BENEFICIARIES */}
      {beneficiaries.length > 0 && step === 1 && (
        <div className="mt-6">
          <p className="text-sm mb-2 dark:text-gray-300">Saved Beneficiaries</p>
          <div className="space-y-2">
            {beneficiaries.map(b => (
              <button
                key={b.id}
                onClick={() => useBeneficiary(b)}
                className="w-full text-left p-3 rounded bg-gray-100 dark:bg-gray-800"
              >
                <div className="font-medium dark:text-white">
                  {b.accountName}
                </div>
                <div className="text-xs text-gray-500">
                  {b.bankName} • {b.accountNumber}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* BANK MODAL */}
      {bankModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 w-full max-w-md rounded p-4">
            <input
              value={bankSearch}
              onChange={e => setBankSearch(e.target.value)}
              placeholder="Search bank…"
              className="w-full p-2 mb-3 rounded bg-gray-100 dark:bg-gray-800 dark:text-white"
            />

            <div className="max-h-72 overflow-y-auto space-y-1">
              {filteredBanks.map(b => (
                <button
                  key={b.code}
                  onClick={() => {
                    setBankCode(b.code);
                    setBankName(b.name);
                    setBankModal(false);
                  }}
                  className="w-full text-left p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-white"
                >
                  {b.name}
                </button>
              ))}
            </div>

            <button
              onClick={() => setBankModal(false)}
              className="mt-3 w-full p-2 text-sm text-gray-500"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
