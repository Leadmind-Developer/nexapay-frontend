"use client";
import { useEffect, useState } from "react";
import api from "@/lib/api";

export default function AdminApprovals() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    api.get("/admin/approvals").then(r => setItems(r.data.approvals));
  }, []);

  const approve = async (id: string) => {
    await api.post(`/admin/approvals/${id}/approve`);
    setItems(items.filter(i => i.id !== id));
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Pending Approvals</h2>

      {items.map(a => (
        <div key={a.id} className="bg-white p-4 rounded mb-3">
          <p>{a.type}</p>
          <button onClick={() => approve(a.id)} className="btn">
            Approve
          </button>
        </div>
      ))}
    </div>
  );
}
