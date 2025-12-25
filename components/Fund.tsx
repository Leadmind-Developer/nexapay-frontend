"use client";

import { useEffect, useState, useMemo } from "react";
import api from "@/lib/api";
import { Dialog } from "@headlessui/react";

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

  // Fetch current user info
  useEffect(() => {
    const u = localStorage.getItem("user");
    if (!u) return;
    setUser(JSON.parse(u));
  }, []);

  // Fetch campaigns & wallet live every 10s
  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        // Campaigns
        const res = await api.get("/funds");
        setCampaigns(res.data.data || []);

        // Wallet
        const walletRes = await api.get("/wallet/me");
        if (walletRes.data.success) {
          setWalletBalance(walletRes.data.wallet.balance);
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 10000); // 10 seconds
    return () => clearInterval(interval);
  }, [user]);

  const myCampaigns = useMemo(() => {
    if (!user) return [];
    return campaigns.filter(c => c.creatorID === user.userID);
  }, [campaigns, user]);

  async function createCampaign(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return setMessage("Login required");

    if (!accountNumber || !bankName) return setMessage("Destination account required");
    try {
      const res = await api.post("/wallet/provision", { accountNumber, bankName });
      if (!res.data.success) return setMessage("Invalid account");
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
        setTitle(""); setDesc(""); setGoal(""); setDuration(""); setCategory(""); setAccountNumber(""); setBankName("");
      } else setMessage(res.data.error || "Failed");
    } catch (err: any) {
      setMessage(err.response?.data?.error || err.message);
    }
  }

  async function donate(campaignID: string) {
    if (!user) return setMessage("Login required");
    const amt = prompt("Enter donation amount (NGN)");
    if (!amt) return;
    try {
      const res = await api.post("/funds/donate", { campaignID, donorID: user.userID, amount: Number(amt) });
      if (res.data.data?.data?.authorization_url) window.location.href = res.data.data.data.authorization_url;
      else setMessage("Unable to start payment");
    } catch (err: any) {
      setMessage(err.response?.data?.error || err.message);
    }
  }

  const sortedCampaigns = useMemo(() => {
    return campaigns.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [campaigns]);

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">

      {/* USER CAMPAIGN DASHBOARD CARD */}
      {user && myCampaigns.length > 0 && (
        <div className="border p-4 rounded bg-gray-50 dark:bg-gray-800">
          <h3 className="font-semibold">Hi {user.firstName}, you have {myCampaigns.length} active campaign{myCampaigns.length > 1 ? "s" : ""}</h3>
          {walletBalance !== null && (
            <p className="text-sm mt-1">Wallet Balance: ₦{walletBalance}</p>
          )}
          <div className="mt-2 space-y-2">
            {myCampaigns.map(c => {
              const progress = Math.min((c.raisedAmount / c.goalAmount) * 100, 100);
              return (
                <div key={c.id}>
                  <div className="flex justify-between text-sm">
                    <span>{c.title}</span>
                    <span>₦{c.raisedAmount} / ₦{c.goalAmount}</span>
                  </div>
                  <div className="w-full bg-gray-300 dark:bg-gray-700 h-2 rounded mt-1">
                    <div className="bg-green-500 h-2 rounded transition-all duration-500" style={{ width: `${progress}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* CREATE CAMPAIGN FORM */}
      <h2 className="text-xl font-semibold mb-4">Create Campaign</h2>
      <form onSubmit={createCampaign} className="space-y-3">
        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Title" className="w-full p-2 border rounded" />
        <textarea value={desc} onChange={e => setDesc(e.target.value)} placeholder="Description" className="w-full p-2 border rounded" />
        <input value={goal} onChange={e => setGoal(e.target.value)} placeholder="Goal amount" className="w-full p-2 border rounded" />
        <input value={duration} onChange={e => setDuration(e.target.value)} placeholder="Duration (days)" className="w-full p-2 border rounded" />
        <input value={category} onChange={e => setCategory(e.target.value)} placeholder="Category" className="w-full p-2 border rounded" />
        <input value={accountNumber} onChange={e => setAccountNumber(e.target.value)} placeholder="Destination Account Number" className="w-full p-2 border rounded" />
        <input value={bankName} onChange={e => setBankName(e.target.value)} placeholder="Bank Name" className="w-full p-2 border rounded" />
        <button className="btn bg-blue-600 text-white px-4 py-2 rounded" type="submit" disabled={myCampaigns.length > 0}>
          {myCampaigns.length > 0 ? "Campaign Created (cannot edit)" : "Create Campaign"}
        </button>
      </form>

      {/* ACTIVE CAMPAIGNS LIST */}
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
              <div className="mt-2 flex gap-2 items-center">
                <div className="text-sm">Raised: ₦{c.raisedAmount} / ₦{c.goalAmount}</div>
                <div className="w-24 h-2 bg-gray-300 dark:bg-gray-700 rounded overflow-hidden">
                  <div className="bg-green-500 h-2 rounded transition-all duration-500" style={{ width: `${progress}%` }} />
                </div>
                <button className="btn ml-auto bg-green-600 text-white px-3 py-1 rounded" onClick={() => donate(c.id)}>Donate</button>
              </div>
            </div>
          );
        })}
      </div>

      {message && <p className="mt-4 text-sm text-green-600">{message}</p>}

      {/* CAMPAIGN DETAIL MODAL */}
      {selectedCampaign && (
        <Dialog open={!!selectedCampaign} onClose={() => setSelectedCampaign(null)} className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-50" />
            <div className="relative bg-white dark:bg-gray-900 rounded-lg max-w-3xl w-full p-6 space-y-4 z-50">
              <Dialog.Title className="text-xl font-bold">{selectedCampaign.title}</Dialog.Title>
              <div className="space-y-2">
                <p><strong>Description:</strong> {selectedCampaign.description}</p>
                <p><strong>Category:</strong> {selectedCampaign.category || "N/A"}</p>
                <p><strong>Goal:</strong> ₦{selectedCampaign.goalAmount}</p>
                <p><strong>Raised:</strong> ₦{selectedCampaign.raisedAmount}</p>
                <p><strong>Duration:</strong> {selectedCampaign.durationDays || "N/A"} days</p>
                <p><strong>Destination Account:</strong> {selectedCampaign.bankName || "N/A"} - {selectedCampaign.accountNumber || "N/A"}</p>
                {walletBalance !== null && <p className="text-sm">Wallet Balance: ₦{walletBalance}</p>}
                <div className="w-full bg-gray-300 dark:bg-gray-700 h-2 rounded mt-1">
                  <div
                    className="bg-green-500 h-2 rounded transition-all duration-500"
                    style={{ width: `${Math.min((selectedCampaign.raisedAmount / selectedCampaign.goalAmount) * 100, 100)}%` }}
                  />
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <button className="flex-1 bg-green-600 text-white py-2 rounded" onClick={() => donate(selectedCampaign.id)}>Donate</button>
                <button className="flex-1 bg-gray-200 py-2 rounded" onClick={() => setSelectedCampaign(null)}>Close</button>
              </div>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
}
