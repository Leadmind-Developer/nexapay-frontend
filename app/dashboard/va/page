"use client";

import React, { useEffect, useState } from "react";
import api from "@/lib/api";

interface Prefix {
  id?: string | number;
  prefix: string;
  description?: string;
}

export default function VirtualAccountPage() {
  const [loading, setLoading] = useState(false);

  // Account Lookup
  const [accountNumber, setAccountNumber] = useState("");
  const [accountResult, setAccountResult] = useState<any>(null);

  // Prefix
  const [prefixes, setPrefixes] = useState<Prefix[]>([]);
  const [prefix, setPrefix] = useState("");
  const [prefixDetails, setPrefixDetails] = useState<any>(null);

  // Transaction Query
  const [transactionRef, setTransactionRef] = useState("");
  const [transactionResult, setTransactionResult] = useState<any>(null);

  // ---------------- Account Lookup ----------------
  const handleAccountLookup = async () => {
    if (!accountNumber) return alert("Enter account number");
    setLoading(true);
    try {
      const res = await api.post("/wema/virtual-account/account-lookup", { accountNumber });
      setAccountResult(res.data.result);
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || "Lookup failed");
    } finally {
      setLoading(false);
    }
  };

  // ---------------- Prefix Management ----------------
  const fetchPrefixes = async () => {
    setLoading(true);
    try {
      const res = await api.get("/wema/virtual-account/prefix");
      setPrefixes(res.data.result || []);
    } catch (err: any) {
      console.error(err);
      alert("Failed to fetch prefixes");
    } finally {
      setLoading(false);
    }
  };

  const handleGetPrefix = async () => {
    if (!prefix) return alert("Enter prefix");
    setLoading(true);
    try {
      const res = await api.get(`/wema/virtual-account/prefix/${prefix}`);
      setPrefixDetails(res.data.result);
    } catch (err: any) {
      console.error(err);
      alert("Failed to fetch prefix details");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrModifyPrefix = async (endpoint: "create" | "modify", payload: any) => {
    setLoading(true);
    try {
      const res = await api.post(`/wema/virtual-account/prefix/${endpoint}`, payload);
      alert(res.data.message);
      fetchPrefixes();
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || "Operation failed");
    } finally {
      setLoading(false);
    }
  };

  // ---------------- Transaction Query ----------------
  const handleQueryTransaction = async () => {
    if (!transactionRef) return alert("Enter transaction reference");
    setLoading(true);
    try {
      const res = await api.post("/wema/virtual-account/transaction/query", {
        reference: transactionRef,
      });
      setTransactionResult(res.data.result);
    } catch (err: any) {
      console.error(err);
      alert("Transaction query failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrefixes();
  }, []);

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Virtual Account Management</h1>

      {/* Account Lookup */}
      <section className="mb-8">
        <h2 className="font-semibold mb-2">Account Lookup</h2>
        <input
          type="text"
          placeholder="Enter account number"
          value={accountNumber}
          onChange={(e) => setAccountNumber(e.target.value)}
          className="w-full border p-2 rounded mb-2"
        />
        <button
          onClick={handleAccountLookup}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Lookup Account
        </button>
        {accountResult && (
          <pre className="mt-2 bg-gray-100 p-2 rounded overflow-x-auto">
            {JSON.stringify(accountResult, null, 2)}
          </pre>
        )}
      </section>

      {/* Prefix Management */}
      <section className="mb-8">
        <h2 className="font-semibold mb-2">Prefixes</h2>

        <ul className="mb-4">
          {prefixes.map((p) => (
            <li key={p.id || p.prefix} className="mb-1">
              {p.prefix} - {p.description || ""}
            </li>
          ))}
        </ul>

        <input
          type="text"
          placeholder="Enter prefix to get details"
          value={prefix}
          onChange={(e) => setPrefix(e.target.value)}
          className="w-full border p-2 rounded mb-2"
        />
        <button
          onClick={handleGetPrefix}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 mr-2"
        >
          Get Prefix
        </button>
        {prefixDetails && (
          <pre className="mt-2 bg-gray-100 p-2 rounded overflow-x-auto">
            {JSON.stringify(prefixDetails, null, 2)}
          </pre>
        )}

        <div className="mt-4">
          <h3 className="font-medium mb-2">Create / Modify Prefix</h3>
          <input
            type="text"
            placeholder="Prefix code"
            value={prefix}
            onChange={(e) => setPrefix(e.target.value)}
            className="w-full border p-2 rounded mb-2"
          />
          <div className="flex gap-2">
            <button
              onClick={() =>
                handleCreateOrModifyPrefix("create", { prefix, description: "New prefix" })
              }
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Create Prefix
            </button>
            <button
              onClick={() =>
                handleCreateOrModifyPrefix("modify", { prefix, description: "Updated" })
              }
              className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700"
            >
              Modify Prefix
            </button>
          </div>
        </div>
      </section>

      {/* Transaction Query */}
      <section className="mb-8">
        <h2 className="font-semibold mb-2">Transaction Query</h2>
        <input
          type="text"
          placeholder="Enter transaction reference"
          value={transactionRef}
          onChange={(e) => setTransactionRef(e.target.value)}
          className="w-full border p-2 rounded mb-2"
        />
        <button
          onClick={handleQueryTransaction}
          className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
        >
          Query Transaction
        </button>
        {transactionResult && (
          <pre className="mt-2 bg-gray-100 p-2 rounded overflow-x-auto">
            {JSON.stringify(transactionResult, null, 2)}
          </pre>
        )}
      </section>

      {loading && <p className="text-center text-blue-600 font-medium">Loading...</p>}
    </div>
  );
}
