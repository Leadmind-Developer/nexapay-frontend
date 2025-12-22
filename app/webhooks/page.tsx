"use client";
import useSWR from "swr";
import api from "@/lib/api";

const fetcher = (url: string) => api.get(url).then(r => r.data);

export default function WebhooksPage() {
  const { data, error, mutate } = useSWR("/webhook", fetcher, {
    refreshInterval: 5000,
  });

  async function replay(id: number) {
    await api.post(`/webhook/${id}/replay`);
    mutate();
  }

  return (
    <div className="max-w-5xl mx-auto p-4">
      <h2 className="text-xl font-semibold mb-4">Webhook Events</h2>

      {error && <div className="text-red-500">Failed to load</div>}
      {!data && <div>Loading...</div>}

      {data?.map((w: any) => (
        <div
          key={w.id}
          className="bg-white dark:bg-gray-800 p-4 rounded mb-4 border"
        >
          <div className="flex justify-between items-center">
            <div>
              <strong>{w.platform}</strong> — {w.event}
              {w.reference && (
                <div className="text-sm text-gray-500">
                  Ref: {w.reference}
                </div>
              )}
            </div>

            <div className="flex items-center gap-3">
              <span
                className={`text-xs px-2 py-1 rounded ${
                  w.status === "processed"
                    ? "bg-green-100 text-green-700"
                    : w.status === "failed"
                    ? "bg-red-100 text-red-700"
                    : "bg-yellow-100 text-yellow-700"
                }`}
              >
                {w.status}
              </span>

              <button
                onClick={() => replay(w.id)}
                className="text-sm px-3 py-1 bg-blue-600 text-white rounded"
              >
                Replay
              </button>
            </div>
          </div>

          {w.lastError && (
            <div className="mt-2 text-red-600 text-sm">
              Error: {w.lastError}
            </div>
          )}

          <pre className="mt-3 bg-gray-50 dark:bg-gray-900 p-2 rounded text-xs overflow-auto">
            {JSON.stringify(w.payload, null, 2)}
          </pre>
        </div>
      ))}
    </div>
  );
}
