"use client";

import React, { useState } from "react";
import api from "../lib/api";
import { SessionManagerWeb } from "../lib/SessionManagerWeb";

export default function SetUsernamePage() {
  const [username, setUsername] = useState("");
  const [checking, setChecking] = useState(false);
  const [available, setAvailable] = useState<boolean | null>(null);
  const [saving, setSaving] = useState(false);

  const validateUsername = (value: string) => /^[a-zA-Z0-9_]{3,15}$/.test(value);

  const checkAvailability = async (value: string) => {
    if (!validateUsername(value)) {
      setAvailable(null);
      return;
    }
    setChecking(true);
    try {
      const res = await api.get(`/wallet/resolve/${value}`);
      if (res.data.success) setAvailable(false);
    } catch (err: any) {
      if (err.response?.status === 404) setAvailable(true);
      else {
        console.log(err);
        setAvailable(null);
      }
    } finally {
      setChecking(false);
    }
  };

  const saveUsername = async () => {
    if (!username) return window.alert("Username cannot be empty");
    if (!validateUsername(username))
      return window.alert(
        "Username must be 3-15 characters, letters/numbers/underscore only"
      );
    if (!available) return window.alert("Username is already taken");

    setSaving(true);
    try {
      const res = await api.put("/user/me", { userID: username });
      if (res.data.success) {
        const me = await api.get("/user/me");
        if (me.data.success) {
          const updatedUser = me.data.user;
          setUsername(updatedUser.userID || "");
          await SessionManagerWeb.setUser(updatedUser); // save user locally
          window.alert("Username set successfully");
        }
      }
    } catch (err) {
      console.log(err);
      window.alert("Failed to set username");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="max-w-md w-full bg-white rounded-xl shadow-md p-6 space-y-4">
        <h1 className="text-2xl font-bold text-gray-800">Set Your Username</h1>
        <p className="text-gray-600 text-sm">
          Your username will be used for internal transfers and wallet operations.
        </p>

        <div className="space-y-1">
          <input
            type="text"
            placeholder="Enter username"
            className="w-full border border-gray-300 rounded-lg p-3 text-gray-800"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
              setAvailable(null);
              checkAvailability(e.target.value);
            }}
          />
          {checking && <p className="text-sm text-gray-500">Checking availability...</p>}
          {available === true && <p className="text-sm text-green-600 font-semibold">✅ Username available</p>}
          {available === false && <p className="text-sm text-red-600 font-semibold">❌ Username already taken</p>}
        </div>

        <button
          onClick={saveUsername}
          disabled={saving}
          className={`w-full py-3 rounded-lg text-white font-semibold ${
            saving ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {saving ? "Saving..." : "Save Username"}
        </button>
      </div>
    </div>
  );
}
