"use client";
import { useState, useEffect } from "react";
import api from "@/lib/api";

export default function FundsPage() {
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [goal, setGoal] = useState("");
  const [message, setMessage] = useState("");
  const [campaigns, setCampaigns] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get("/funds");
        setCampaigns(res.data.data || []);
      } catch (err) {}
    })();
  }, []);

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
      });
      if (res.data.success) {
        setMessage("Campaign created");
        setCampaigns(prev => [res.data.data, ...prev]);
      } else setMessage(res.data.error || "Failed");
    } catch (err: any) {
      setMessage(err.response?.data?.error || err.message);
    }
  }

  async function donate(campaignID: string) {
    const u = localStorage.getItem("user");
    const donorID = u ? JSON.parse(u).userID : null;
    const amt = prompt("Enter amount to donate (NGN)");
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

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h2 className="text-xl font-semibold mb-4">Create Campaign</h2>

      <form onSubmit={createCampaign} className="space-y-3 mb-6">
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" className="w-full p-2 border rounded" />
        <textarea value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Description" className="w-full p-2 border rounded" />
        <input value={goal} onChange={(e) => setGoal(e.target.value)} placeholder="Goal amount" className="w-full p-2 border rounded" />
        <button className="btn" type="submit">Create</button>
      </form>

      <h3 className="text-lg font-medium mb-2">Active Campaigns</h3>
      <div className="grid gap-3">
        {campaigns.map((c) => (
          <div key={c.id} className="border p-3 rounded">
            <h4 className="font-semibold">{c.title}</h4>
            <p className="text-sm text-gray-600">{c.description}</p>
            <div className="mt-2 flex gap-2 items-center">
              <div className="text-sm">Raised: ₦{c.raisedAmount} / ₦{c.goalAmount}</div>
              <button className="btn ml-auto" onClick={() => donate(c.id)}>Donate</button>
            </div>
          </div>
        ))}
      </div>

      {message && <p className="mt-4 text-sm text-green-600">{message}</p>}
    </div>
  );
}
