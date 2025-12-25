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
  createdAt: string;
}

export default function FundsPage() {
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [goal, setGoal] = useState("");
  const [duration, setDuration] = useState("");
  const [category, setCategory] = useState("");
  const [message, setMessage] = useState("");
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);

  useEffect(() => {
    fetchCampaigns();
  }, []);

  async function fetchCampaigns() {
    try {
      const res = await api.get("/funds");
      setCampaigns(res.data.data || []);
    } catch (err) {
      console.error(err);
    }
  }

  async function createCampaign(e: React.FormEvent) {
    e.preventDefault();
    const u = localStorage.getItem("user");
    if (!u) return setMessage("Login required");
    const creatorID = JSON.parse(u).userID;

    try {
      const res = await api.post("/funds/create", {
        creatorID,
        title,
        description: desc,
        goalAmount: Number(goal),
        durationDays: duration ? Number(duration) : undefined,
        category,
      });
      if (res.data.success) {
        setMessage("Campaign created successfully");
        setCampaigns(prev => [res.data.data, ...prev]);
        setTitle(""); setDesc(""); setGoal(""); setDuration(""); setCategory("");
      } else setMessage(res.data.error || "Failed");
    } catch (err: any) {
      setMessage(err.response?.data?.error || err.message);
    }
  }

  async function donate(campaignID: string) {
    const u = localStorage.getItem("user");
    const donorID = u ? JSON.parse(u).userID : null;
    const amt = prompt("Enter donation amount (NGN)");
    if (!amt) return;

    try {
      const res = await api.post("/funds/donate", { campaignID, donorID, amount: Number(amt) });
      if (res.data.data?.data?.authorization_url) {
        window.location.href = res.data.data.data.authorization_url;
      } else setMessage("Unable to start payment");
    } catch (err: any) {
      setMessage(err.response?.data?.error || err.message);
    }
  }

  const sortedCampaigns = useMemo(() => {
    return campaigns.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [campaigns]);

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <h2 className="text-xl font-semibold mb-4">Create Campaign</h2>

      <form onSubmit={createCampaign} className="space-y-3">
        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Title" className="w-full p-2 border rounded" />
        <textarea value={desc} onChange={e => setDesc(e.target.value)} placeholder="Description" className="w-full p-2 border rounded" />
        <input value={goal} onChange={e => setGoal(e.target.value)} placeholder="Goal amount" className="w-full p-2 border rounded" />
        <input value={duration} onChange={e => setDuration(e.target.value)} placeholder="Duration (days)" className="w-full p-2 border rounded" />
        <input value={category} onChange={e => setCategory(e.target.value)} placeholder="Category" className="w-full p-2 border rounded" />
        <button className="btn bg-blue-600 text-white px-4 py-2 rounded" type="submit">Create Campaign</button>
      </form>

      <h3 className="text-lg font-medium">Active Campaigns</h3>
      <div className="grid gap-3">
        {sortedCampaigns.map(c => (
          <div
            key={c.id}
            className="border p-3 rounded hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
            onClick={() => setSelectedCampaign(c)}
          >
            <h4 className="font-semibold">{c.title}</h4>
            <p className="text-sm text-gray-600">{c.description}</p>
            <div className="mt-2 flex gap-2 items-center">
              <div className="text-sm">Raised: ₦{c.raisedAmount} / ₦{c.goalAmount}</div>
              <button className="btn ml-auto bg-green-600 text-white px-3 py-1 rounded" onClick={() => donate(c.id)}>Donate</button>
            </div>
          </div>
        ))}
      </div>

      {message && <p className="mt-4 text-sm text-green-600">{message}</p>}

      {/* Campaign Detail Modal */}
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
              </div>

              <div className="flex gap-2 mt-4">
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
        </Dialog>
      )}
    </div>
  );
}
