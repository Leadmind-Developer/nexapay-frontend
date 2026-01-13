"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";

type PushDevice = {
  id: number;
  platform: string;
  createdAt: string;
};

export default function PushDevicesPage() {
  const [devices, setDevices] = useState<PushDevice[]>([]);

  const load = async () => {
    const res = await api.get("/auth/push-devices");
    setDevices(res.data);
  };

  useEffect(() => {
    load();
  }, []);

  const revoke = async (id: number) => {
    await api.delete(`/auth/push-devices/${id}`);
    load();
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <h1 className="text-lg font-semibold mb-4">Push devices</h1>

      {devices.length === 0 && (
        <p className="text-sm text-zinc-500">
          No registered devices
        </p>
      )}

      {devices.map((d) => (
        <div
          key={d.id}
          className="flex justify-between items-center border-b py-3"
        >
          <div>
            <p className="text-sm font-medium">{d.platform}</p>
            <p className="text-xs text-zinc-500">
              Added {new Date(d.createdAt).toLocaleDateString()}
            </p>
          </div>

          <button
            onClick={() => revoke(d.id)}
            className="text-red-600 text-sm"
          >
            Revoke
          </button>
        </div>
      ))}
    </div>
  );
}
