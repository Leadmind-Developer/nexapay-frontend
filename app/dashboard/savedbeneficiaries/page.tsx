"use client";

import React, { useEffect, useState } from "react";
import { IoArrowBack, IoTrashOutline } from "react-icons/io5";
import api from "@/lib/api";

interface Beneficiary {
  id: number;
  accountName: string;
  bankName: string;
  accountNumber: string;
}

export default function SavedBeneficiariesPage({ navigateBack }: { navigateBack: () => void }) {
  const [items, setItems] = useState<Beneficiary[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get("/beneficiaries");
      if (res.data.success) setItems(res.data.data);
    } catch (err) {
      alert("Failed to load beneficiaries");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const removeBeneficiary = async (id: number) => {
    const confirm = window.confirm("Remove this beneficiary?");
    if (!confirm) return;

    try {
      await api.delete(`/beneficiaries/${id}`);
      load();
    } catch {
      alert("Unable to delete beneficiary");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-blue-700 text-white p-4 flex items-center">
        <button onClick={navigateBack} className="mr-4">
          <IoArrowBack size={24} />
        </button>
        <h1 className="flex-1 text-center text-lg font-bold">Saved Beneficiaries</h1>
        <div style={{ width: 24 }} /> {/* placeholder for centering */}
      </div>

      {/* Beneficiary List */}
      <div className="max-w-2xl mx-auto mt-4">
        {loading ? (
          <p className="text-center py-8">Loading...</p>
        ) : items.length === 0 ? (
          <p className="text-center py-8 text-gray-500">No saved beneficiaries</p>
        ) : (
          <div className="bg-white rounded-lg shadow divide-y divide-gray-200">
            {items.map((item) => (
              <div key={item.id} className="flex justify-between items-center px-4 py-3">
                <div>
                  <p className="font-semibold text-gray-800">{item.accountName}</p>
                  <p className="text-gray-500 text-sm">
                    {item.bankName} • {item.accountNumber}
                  </p>
                </div>
                <button
                  onClick={() => removeBeneficiary(item.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  <IoTrashOutline size={20} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
