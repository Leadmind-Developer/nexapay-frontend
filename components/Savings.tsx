"use client";
import { useState } from "react";
import api from "@/lib/api";
import { useRouter } from "next/navigation";

export default function SavingsPage() {
  const [type, setType] = useState<"daily"|"weekly"|"monthly">("daily");
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");
  const router = useRouter();

  async function createPlan(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");
    try {
      // assume userID is stored in localStorage.user.userID
      const user = localStorage.getItem("user");
      const userID = user ? JSON.parse(user).userID : null;
      if (!userID) return setMessage("You must be logged in.");

      const res = await api.post("/savings/create", { userID, type, amount: Number(amount) });
      if (res.data.success) {
        setMessage("Plan created!");
        setTimeout(() => router.refresh(), 800);
      } else setMessage(res.data.error || "Failed");
    } catch (err: any) {
      setMessage(err.response?.data?.error || err.message);
    }
  }

  async function deposit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const user = localStorage.getItem("user");
      const userID = user ? JSON.parse(user).userID : null;
      if (!userID) return setMessage("You must be logged in.");

      // For simplicity we use the first saving plan
      const plansRes = await api.get(`/savings/${userID}`);
      const plans = plansRes.data.data || [];
      if (plans.length === 0) return setMessage("Please create a saving plan first.");

      const savingId = plans[0].id;
      const res = await api.post("/savings/deposit", { userID, savingId, amount: Number(amount) });
      if (res.data.data?.data?.authorization_url) {
        // redirect to paystack checkout
        window.location.href = res.data.data.data.authorization_url;
      } else {
        setMessage("Unable to start payment");
      }
    } catch (err: any) {
      setMessage(err.response?.data?.error || err.message);
    }
  }

  return (
    <div className="p-6 max-w-lg mx-auto">
      <h2 className="text-xl font-semibold mb-4">Savings</h2>

      <form onSubmit={createPlan} className="space-y-3 mb-6">
        <label className="block">
          <div className="text-sm">Plan frequency</div>
          <select value={type} onChange={(e) => setType(e.target.value as any)} className="w-full p-2 border rounded">
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </label>

        <label className="block">
          <div className="text-sm">Amount</div>
          <input value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full p-2 border rounded" />
        </label>

        <div>
          <button className="btn" type="submit">Create Plan</button>
        </div>
      </form>

      <form onSubmit={deposit} className="space-y-3">
        <h3 className="font-medium">Deposit to plan</h3>
        <label className="block">
          <div className="text-sm">Amount</div>
          <input value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full p-2 border rounded" />
        </label>

        <button className="btn" type="submit">Deposit (Paystack)</button>
      </form>

      {message && <p className="mt-4 text-sm text-green-600">{message}</p>}
    </div>
  );
}
