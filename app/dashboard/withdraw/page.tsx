"use client";

import React, { useState, useEffect } from "react";
import api from "@/lib/api";

export default function WithdrawPage() {
  const [banks, setBanks] = useState<{ name: string; code: string }[]>([]);
  const [beneficiaries, setBeneficiaries] = useState<any[]>([]);
  const [bankCode, setBankCode] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [amount, setAmount] = useState("");

  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [isValidAccount, setIsValidAccount] = useState(false);
  const [processingWithdrawal, setProcessingWithdrawal] = useState(false);
  const [withdrawalRef, setWithdrawalRef] = useState<string | null>(null);

  const [bankSearch, setBankSearch] = useState("");

  // Fetch banks
  useEffect(() => {
    api.get("/paystack/banks")
      .then((res) => setBanks(res.data.data))
      .catch(() => alert("Unable to load banks"));
  }, []);

  // Fetch beneficiaries
  useEffect(() => {
    api.get("/beneficiaries")
      .then((res) => res.data.success && setBeneficiaries(res.data.data))
      .catch(() => console.log("Beneficiaries load error"));
  }, []);

  // Verify account when account number or bank code changes
  useEffect(() => {
    if (accountNumber.length < 10 || !bankCode) {
      setAccountName("");
      setIsValidAccount(false);
      return;
    }

    const timeout = setTimeout(async () => {
      try {
        setVerifying(true);
        const res = await api.get(
          `/paystack/resolve-account?account_number=${accountNumber}&bank_code=${bankCode}`
        );
        if (res.data.success && res.data.data.account_name) {
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
    }, 700);

    return () => clearTimeout(timeout);
  }, [accountNumber, bankCode]);

  const transferToBank = async () => {
    const amt = Number(amount);
    if (!bankCode) return alert("Select a bank");
    if (accountNumber.length < 10) return alert("Invalid account number");
    if (!amt || amt < 100) return alert("Min amount is ₦100");
    if (!accountName || !isValidAccount) return alert("Invalid account");

    try {
      setLoading(true);
      const res = await api.post("/wallet/withdraw", {
        bankCode,
        accountNumber,
        accountName,
        amount: Math.round(amt * 100),
      });

      if (!res.data.success) throw new Error(res.data.message);

      setProcessingWithdrawal(true);
      setWithdrawalRef(res.data.transferReference);

      alert(`₦${amt} will be sent to ${accountName}. Your wallet will be debited once confirmed.`);

      const save = confirm(`Do you want to save ${accountName} (${bankName}) as beneficiary?`);
      if (save) {
        await api.post("/beneficiaries/add", {
          bankName,
          bankCode,
          accountNumber,
          accountName,
        });
        alert("Beneficiary saved!");
      }

      setAmount("");
      setBankName("");
      setBankCode("");
      setAccountNumber("");
      setAccountName("");
      setIsValidAccount(false);

    } catch (err: any) {
      alert(err.message || "Unable to transfer");
    } finally {
      setLoading(false);
    }
  };

  const filteredBanks = banks.filter(b => b.name.toLowerCase().includes(bankSearch.toLowerCase()));
  const amountNum = Number(amount);
  const isButtonDisabled =
    !isValidAccount || verifying || loading || processingWithdrawal || !bankCode || !amount || amountNum < 100;

  const useBeneficiary = (b: any) => {
    setBankName(b.bankName);
    setBankCode(b.bankCode);
    setAccountNumber(b.accountNumber);
    setAccountName(b.accountName);
    setIsValidAccount(true);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4 text-center">Transfer to Bank</h1>

      {processingWithdrawal && (
        <div className="bg-yellow-100 text-yellow-800 p-3 rounded mb-4">
          Withdrawal is processing. Your wallet will be debited once confirmed.
        </div>
      )}

      {/* Saved Beneficiaries */}
      {beneficiaries.length > 0 && (
        <div className="mb-4">
          <label className="block text-gray-700 mb-1">Saved Beneficiaries</label>
          <select
            className="w-full p-2 border rounded"
            onChange={e => useBeneficiary(JSON.parse(e.target.value))}
          >
            <option value="">Select Beneficiary</option>
            {beneficiaries.map(b => (
              <option key={b.id} value={JSON.stringify(b)}>
                {b.accountName} • {b.bankName} • {b.accountNumber}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Bank Selector */}
      <div className="mb-4">
        <label className="block text-gray-700 mb-1">Select Bank</label>
        <input
          type="text"
          placeholder="Search bank..."
          value={bankSearch}
          onChange={e => setBankSearch(e.target.value)}
          className="w-full p-2 border rounded mb-2"
        />
        <select
          value={bankCode}
          onChange={e => {
            const bank = banks.find(b => b.code === e.target.value);
            setBankCode(e.target.value);
            setBankName(bank?.name || "");
          }}
          className="w-full p-2 border rounded"
        >
          <option value="">Select Bank</option>
          {filteredBanks.map(b => (
            <option key={b.code} value={b.code}>{b.name}</option>
          ))}
        </select>
      </div>

      {/* Account Number */}
      <div className="mb-4">
        <label className="block text-gray-700 mb-1">Account Number</label>
        <input
          type="text"
          value={accountNumber}
          onChange={e => setAccountNumber(e.target.value)}
          className={`w-full p-2 border rounded ${!isValidAccount && accountNumber.length >= 10 ? 'border-red-500' : ''}`}
          placeholder="Enter account number"
        />
        <div className={`mt-1 p-2 rounded text-white ${verifying ? 'bg-gray-500' : isValidAccount ? 'bg-green-600' : 'bg-red-600'}`}>
          {verifying ? "Verifying..." : accountName ? `Account: ${accountName}` : "Enter account to auto-verify"}
        </div>
      </div>

      {/* Amount */}
      <div className="mb-4">
        <label className="block text-gray-700 mb-1">Amount (₦)</label>
        <input
          type="number"
          value={amount}
          onChange={e => setAmount(e.target.value)}
          className="w-full p-2 border rounded"
          placeholder="Enter amount"
        />
      </div>

      <button
        disabled={isButtonDisabled}
        onClick={transferToBank}
        className={`w-full p-3 rounded text-white ${isButtonDisabled ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}`}
      >
        {loading ? "Processing..." : "Send to Bank"}
      </button>
    </div>
  );
}
