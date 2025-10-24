"use client";
import { useState, useEffect } from "react";
import api from "@/lib/api";

export default function LoansPage() {
  const [purpose, setPurpose] = useState("");
  const [amount, setAmount] = useState("");
  const [instalments, setInstalments] = useState("1");
  const [interest, setInterest] = useState("0");
  const [message, setMessage] = useState("");
  const [loans, setLoans] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const u = localStorage.getItem("user");
      if (!u) return;
      const userID = JSON.parse(u).userID;
      try {
        const res = await api.get(`/loans/${userID}`);
        setLoans(res.data.data || []);
      } catch {}
    })();
  }, []);

  async function requestLoan(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");
    const u = localStorage.getItem("user");
    if (!u) return setMessage("Login required");
    const userID = JSON.parse(u).userID;

    try {
      const res = await api.post("/loans/request", {
        userID,
        purpose,
        amount: Number(amount),
        interestRate: Number(interest),
        instalments: Number(instalments),
      });
      if (res.data.success) {
        setMessage("Loan requested");
        setLoans(prev => [res.data.data, ...prev]);
      } else {
        setMessage(res.data.error || "Failed");
      }
    } catch (err: any) {
      setMessage(err.response?.data?.error || err.message);
    }
  }

  return (
    <div className="p-6 max-w-lg mx-auto">
      <h2 className="text-xl font-semibold mb-4">Loans</h2>

      <form onSubmit={requestLoan} className="space-y-3 mb-6">
        <label>
          <div className="text-sm">Purpose</div>
          <input value={purpose} onChange={(e) => setPurpose(e.target.value)} className="w-full p-2 border rounded" />
        </label>
        <label>
          <div className="text-sm">Amount</div>
          <input value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full p-2 border rounded" />
        </label>
        <label>
          <div className="text-sm">Interest %</div>
          <input value={interest} onChange={(e) => setInterest(e.target.value)} className="w-full p-2 border rounded" />
        </label>
        <label>
          <div className="text-sm">Instalments</div>
          <input value={instalments} onChange={(e) => setInstalments(e.target.value)} className="w-full p-2 border rounded" />
        </label>

        <button className="btn" type="submit">Request Loan</button>
      </form>

      <div>
        <h3 className="font-medium mb-2">Your Loans</h3>
        {loans.length === 0 && <div>No loans yet</div>}
        {loans.map((l) => (
          <div key={l.id} className="border p-3 rounded mb-2">
            <div><strong>Purpose:</strong> {l.purpose}</div>
            <div><strong>Amount:</strong> ₦{l.amount}</div>
            <div><strong>Status:</strong> {l.status}</div>
            <div><strong>Balance:</strong> ₦{l.balance}</div>
          </div>
        ))}
      </div>

      {message && <p className="mt-4 text-sm text-green-600">{message}</p>}
    </div>
  );
}
