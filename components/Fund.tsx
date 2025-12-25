"use client";

import { useEffect, useState, useMemo } from "react";
import api from "@/lib/api";

interface Campaign {
  id: string;
  title: string;
  description: string;
  goalAmount: number;
  raisedAmount: number;
  creatorID: string;
  durationDays?: number;
  category?: string;
  accountNumber?: string;
  bankName?: string;
  createdAt: string;
}

interface User {
  id: string;
  userID: string;
  firstName: string;
  lastName: string;
}

export default function FundsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [goal, setGoal] = useState("");
  const [duration, setDuration] = useState("");
  const [category, setCategory] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [bankName, setBankName] = useState("");
  const [message, setMessage] = useState("");
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);

  // -----------------------
  // Load user from storage
  // -----------------------
  useEffect(() => {
    const u = localStorage.getItem("user");
    if (u) setUser(JSON.parse(u));
  }, []);

  // -----------------------
  // Fetch campaigns + wallet
  // -----------------------
  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        const res = await api.get("/funds");
        setCampaigns(res.data.data || []);

        const walletRes = await api.get("/wallet/me");
        if (walletRes.data.success) {
          setWalletBalance(walletRes.data.wallet.balance);
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, [user]);

  const myCampaigns = useMemo(() => {
    if (!user) return [];
    return campaigns.filter(c => c.creatorID === user.userID);
  }, [campaigns, user]);

  // -----------------------
  // Create campaign
  // -----------------------
  async function createCampaign(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return setMessage("Login required");

    if (!accountNumber || !bankName) {
      return setMessage("Destination account required");
    }

    try {
      const verify = await api.post("/wallet/provision", { accountNumber, bankName });
      if (!verify.data.success) return setMessage("Invalid account");
    } catch (err: any) {
      return setMessage(err.response?.data?.message || err.message);
    }

    try {
      const res = await api.post("/funds/create", {
        creatorID: user.userID,
        title,
        description: desc,
        goalAmount: Number(goal),
        durationDays: duration ? Number(duration) : undefined,
        category,
        accountNumber,
        bankName,
      });

      if (res.data.success) {
        setMessage("Campaign created successfully");
        setCampaigns(prev => [res.data.data, ...prev]);
        setTitle("");
        setDesc("");
        setGoal("");
        setDuration("");
        setCategory("");
        setAccountNumber("");
        setBankName("");
      } else {
        setMessage(res.data.error || "Failed");
      }
    } catch (err: any) {
      setMessage(err.response?.data?.error || err.message);
    }
  }

  // -----------------------
  // Donate
  // -----------------------
  async function donate(campaignID: string) {
    if (!user) return setMessage("Login required");

    const amt = prompt("Enter donation amount (NGN)");
    if (!amt) return;

    try {
      const res = await api.post("/funds/donate", {
        campaignID,
        donorID: user.userID,
        amount: Number(amt),
      });

      const url = res.data?.data?.data?.authorization_url;
      if (url) window.location.href = url;
      else setMessage("Unable to start payment");
    } catch (err: any) {
      setMessage(err.response?.data?.error || err.message);
    }
  }

  const sortedCampaigns = useMemo(() => {
    return [...campaigns].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [campaigns]);

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">

      {/* USER DASHBOARD */}
      {user && myCampaigns.length > 0 && (
        <div className="border p-4 rounded bg-gray-50 dark:bg-gray-800">
          <h3 className="font-semibold">
            Hi {user.firstName}, you have {myCampaigns.length} active campaign{myCampaigns.length > 1 ? "s" : ""}
          </h3>

          {walletBalance !== null && (
            <p className="text-sm mt-1">Wallet Balance: ₦{walletBalance}</p>
          )}

          <div className="mt-3 space-y-2">
            {myCampaigns.map(c => {
              const progress = Math.min((c.raisedAmount / c.goalAmount) * 100, 100);
              return (
                <div key={c.id}>
                  <div className="flex justify-between text-sm">
                    <span>{c.title}</span>
                    <span>₦{c.raisedAmount} / ₦{c.goalAmount}</span>
                  </div>
                  <div className="w-full bg-gray-300 dark:bg-gray-700 h-2 rounded mt-1">
                    <div
                      className="bg-green-500 h-2 rounded transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* CREATE CAMPAIGN */}
      <h2 className="text-xl font-semibold">Create Campaign</h2>
      <form onSubmit={createCampaign} className="space-y-3">
        <input className="w-full p-2 border rounded" placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} />
        <textarea className="w-full p-2 border rounded" placeholder="Description" value={desc} onChange={e => setDesc(e.target.value)} />
        <input className="w-full p-2 border rounded" placeholder="Goal amount" value={goal} onChange={e => setGoal(e.target.value)} />
        <input className="w-full p-2 border rounded" placeholder="Duration (days)" value={duration} onChange={e => setDuration(e.target.value)} />
        <input className="w-full p-2 border rounded" placeholder="Category" value={category} onChange={e => setCategory(e.target.value)} />
        <input className="w-full p-2 border rounded" placeholder="Destination Account Number" value={accountNumber} onChange={e => setAccountNumber(e.target.value)} />
        <input className="w-full p-2 border rounded" placeholder="Bank Name" value={bankName} onChange={e => setBankName(e.target.value)} />

        <button
          type="submit"
          disabled={myCampaigns.length > 0}
          className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {myCampaigns.length > 0 ? "Campaign Created" : "Create Campaign"}
        </button>
      </form>

      {/* CAMPAIGNS LIST */}
      <h3 className="text-lg font-medium">Active Campaigns</h3>
      <div className="grid gap-3">
        {sortedCampaigns.map(c => {
          const progress = Math.min((c.raisedAmount / c.goalAmount) * 100, 100);
          return (
            <div
              key={c.id}
              className="border p-3 rounded hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
              onClick={() => setSelectedCampaign(c)}
            >
              <h4 className="font-semibold">{c.title}</h4>
              <p className="text-sm text-gray-600">{c.description}</p>

              <div className="mt-2 flex items-center gap-2">
                <span className="text-sm">₦{c.raisedAmount} / ₦{c.goalAmount}</span>
                <div className="flex-1 h-2 bg-gray-300 dark:bg-gray-700 rounded">
                  <div
                    className="bg-green-500 h-2 rounded transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <button
                  className="bg-green-600 text-white px-3 py-1 rounded"
                  onClick={(e) => {
                    e.stopPropagation();
                    donate(c.id);
                  }}
                >
                  Donate
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {message && <p className="text-sm text-green-600">{message}</p>}

      {/* SIMPLE MODAL */}
      {selectedCampaign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white dark:bg-gray-900 max-w-lg w-full rounded-xl p-6 space-y-3">
            <h3 className="text-xl font-bold">{selectedCampaign.title}</h3>

            <p>{selectedCampaign.description}</p>
            <p><strong>Category:</strong> {selectedCampaign.category || "N/A"}</p>
            <p><strong>Goal:</strong> ₦{selectedCampaign.goalAmount}</p>
            <p><strong>Raised:</strong> ₦{selectedCampaign.raisedAmount}</p>
            <p><strong>Account:</strong> {selectedCampaign.bankName} - {selectedCampaign.accountNumber}</p>

            <div className="w-full bg-gray-300 dark:bg-gray-700 h-2 rounded">
              <div
                className="bg-green-500 h-2 rounded transition-all duration-500"
                style={{
                  width: `${Math.min(
                    (selectedCampaign.raisedAmount / selectedCampaign.goalAmount) * 100,
                    100
                  )}%`
                }}
              />
            </div>

            <div className="flex gap-2 pt-3">
              <button
                className="flex-1 bg-green-600 text-white py-2 rounded"
                onClick={() => donate(selectedCampaign.id)}
              >
                Donate
              </button>
              <button
                className="flex-1 bg-gray-200 py-2 rounded"
                onClick={() => setSelectedCampaign(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
