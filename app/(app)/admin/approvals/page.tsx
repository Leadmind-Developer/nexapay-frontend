"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";

interface ApprovalItem {
  id: string;
  type: string;
  // add more fields if your API returns them
}

export default function AdminApprovals() {
  const [items, setItems] = useState<ApprovalItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApprovals = async () => {
      try {
        const res = await api.get("/admin/approvals");
        setItems(res.data.approvals || []);
      } catch (err) {
        console.error("Failed to load approvals", err);
      } finally {
        setLoading(false);
      }
    };

    fetchApprovals();
  }, []);

  const approve = async (id: string) => {
    try {
      await api.post(`/admin/approvals/${id}/approve`);
      setItems(prev => prev.filter(i => i.id !== id));
    } catch (err) {
      console.error("Approval failed", err);
      alert("Failed to approve item");
    }
  };

  if (loading) {
    return <p className="p-6">Loading approvals…</p>;
  }

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Pending Approvals</h2>

      {items.length === 0 ? (
        <p className="text-gray-500">No pending approvals.</p>
      ) : (
        items.map(a => (
          <div
            key={a.id}
            className="bg-white dark:bg-gray-800 p-4 rounded mb-3 flex justify-between items-center"
          >
            <p className="font-medium">{a.type}</p>

            <button
              onClick={() => approve(a.id)}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-1 rounded"
            >
              Approve
            </button>
          </div>
        ))
      )}
    </div>
  );
}
