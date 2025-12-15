"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

export default function SetUsernamePage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [checking, setChecking] = useState(false);
  const [available, setAvailable] = useState<boolean | null>(null);
  const [saving, setSaving] = useState(false);
  const [locked, setLocked] = useState(false); // 🔒 username already set

  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // -------------------------
  // Load current user (lock if username exists)
  // -------------------------
  useEffect(() => {
    (async () => {
      try {
        const res = await api.get("/user/me");
        if (res.data?.success && res.data.user?.userID) {
          setUsername(res.data.user.userID);
          setLocked(true);
        }
      } catch (err) {
        console.error("Failed to load user", err);
      }
    })();
  }, []);

  // -------------------------
  // Validation
  // -------------------------
  const validateUsername = (value: string) =>
    /^[a-zA-Z0-9_]{3,15}$/.test(value);

  // -------------------------
  // Check availability (debounced)
  // -------------------------
  const checkAvailability = async (value: string) => {
    if (!validateUsername(value)) {
      setAvailable(null);
      return;
    }

    setChecking(true);
    try {
      const res = await api.get(`/wallet/resolve/${value}`);
      if (res.data?.success) {
        // Wallet exists → username taken
        setAvailable(false);
      }
    } catch (err: any) {
      if (err.response?.status === 404) {
        setAvailable(true);
      } else {
        console.error(err);
        setAvailable(null);
      }
    } finally {
      setChecking(false);
    }
  };

  // -------------------------
  // Handle input change
  // -------------------------
  const handleUsernameChange = (value: string) => {
    if (locked) return;

    setUsername(value);
    setAvailable(null);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      checkAvailability(value);
    }, 500);
  };

  // -------------------------
  // Save username
  // -------------------------
  const saveUsername = async () => {
    if (locked) return;

    if (!username) {
      alert("Username cannot be empty");
      return;
    }

    if (!validateUsername(username)) {
      alert(
        "Username must be 3–15 characters and contain only letters, numbers, or underscores"
      );
      return;
    }

    if (available !== true) {
      alert("Username is already taken");
      return;
    }

    setSaving(true);
    try {
      const res = await api.put("/user/me", { userID: username });

      if (res.data?.success) {
        alert("Username set successfully");
        router.push("/dashboard"); // ✅ redirect
      } else {
        alert(res.data?.message || "Failed to set username");
      }
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to set username");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="max-w-md w-full bg-white rounded-xl shadow-md p-6 space-y-4">
        <h1 className="text-2xl font-bold text-gray-800">
          Set Your Username
        </h1>

        <p className="text-gray-600 text-sm">
          Your username will be used for internal transfers and wallet operations.
        </p>

        {/* Username input */}
        <div className="space-y-1">
          <input
            type="text"
            placeholder="Enter username"
            value={username}
            disabled={locked}
            onChange={(e) => handleUsernameChange(e.target.value)}
            className={`w-full border rounded-lg p-3 text-gray-800 focus:outline-none focus:ring-2 ${
              locked
                ? "bg-gray-100 border-gray-300 cursor-not-allowed"
                : "border-gray-300 focus:ring-blue-500"
            }`}
          />

          {locked && (
            <p className="text-sm text-gray-500">
              🔒 Username already set and cannot be changed
            </p>
          )}

          {!locked && checking && (
            <p className="text-sm text-gray-500">
              Checking availability…
            </p>
          )}

          {!locked && available === true && (
            <p className="text-sm text-green-600 font-semibold">
              ✅ Username available
            </p>
          )}

          {!locked && available === false && (
            <p className="text-sm text-red-600 font-semibold">
              ❌ Username already taken
            </p>
          )}
        </div>

        {/* Save button */}
        {!locked && (
          <button
            onClick={saveUsername}
            disabled={saving}
            className={`w-full py-3 rounded-lg text-white font-semibold transition ${
              saving
                ? "bg-blue-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {saving ? "Saving…" : "Save Username"}
          </button>
        )}
      </div>
    </div>
  );
}
