"use client";

import { useState } from "react";
import api from "@/lib/api";

export default function ChangePinPage() {
  const [oldPin, setOldPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setLoading(true);
    try {
      await api.post("/auth/transaction-pin/change", {
        oldPin,
        newPin,
      });
      alert("PIN updated");
      history.back();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <h1 className="text-lg font-semibold mb-4">
        Change transaction PIN
      </h1>

      <input
        type="password"
        inputMode="numeric"
        placeholder="Current PIN"
        value={oldPin}
        onChange={(e) => setOldPin(e.target.value)}
        className="w-full border rounded-lg px-3 py-2 mb-3"
      />

      <input
        type="password"
        inputMode="numeric"
        placeholder="New PIN"
        value={newPin}
        onChange={(e) => setNewPin(e.target.value)}
        className="w-full border rounded-lg px-3 py-2"
      />

      <button
        onClick={submit}
        disabled={loading || newPin.length < 4}
        className="mt-4 w-full bg-indigo-600 text-white rounded-lg py-2"
      >
        {loading ? "Updating…" : "Change PIN"}
      </button>
    </div>
  );
}
